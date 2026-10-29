"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Coffee,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Send,
  Soup,
  Sparkles,
  Square,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentChatLocation } from "@/lib/chat-location";
import { createChatEntryStore } from "@/lib/chat-entry";
import { RecommendedStoreCard } from "./recommended-store-card";
import {
  getApiError,
  hydrateStores,
  sendChat,
  type NearbyStore,
} from "@/lib/api";
import {
  chatMessageSchema,
  chatStoresSchema,
  type ChatLocation,
  type ChatReply,
} from "@/lib/chat-contract";

type UserMessage = {
  id: string;
  kind: "user";
  text: string;
  location?: ChatLocation;
  status: "pending" | "sent" | "failed" | "cancelled";
};
type AssistantMessage = {
  id: string;
  kind: "assistant";
  text: string;
  sources: ChatReply["sources"];
  storeIds: string[];
  location?: ChatLocation;
  stores: NearbyStore[];
  storeStatus: "loading" | "complete" | "partial" | "error";
};
type Message = UserMessage | AssistantMessage;
const starters = [
  {
    icon: Soup,
    title: "แนะนำร้านอาหาร",
    message: "ช่วยแนะนำร้านอาหารให้ฉันหน่อย",
  },
  {
    icon: Coffee,
    title: "หาร้านกาแฟ",
    message: "ช่วยแนะนำร้านกาแฟให้ฉันหน่อย",
  },
  {
    icon: Sparkles,
    title: "ลองร้านใหม่",
    message:
      "ช่วยแนะนำร้านที่น่าลองใหม่ๆให้ฉันหน่อย",
  },
  {
    icon: Wallet,
    title: "รู้จัก THAI Please",
    message: "คุณช่วยเรื่องอะไรในระบบ THAI Please ได้บ้าง",
  },
];

export function AiChat() {
  const [entry] = useState(() =>
    createChatEntryStore(typeof window === "undefined" ? undefined : window),
  );
  const revision = useSyncExternalStore(
    entry.subscribe,
    entry.getSnapshot,
    entry.getServerSnapshot,
  );
  return <ChatConversation key={revision} />;
}

function ChatConversation() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);
  const locationWarningShown = useRef(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const activeRequest = useRef<AbortController | null>(null);
  const requests = useRef(new Set<AbortController>());
  const cardJobs = useRef(new Set<string>());
  const bottom = useRef<HTMLDivElement>(null);
  const form = useForm<{ message: string }>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: "" },
  });
  const draft = useWatch({ control: form.control, name: "message" }) ?? "";

  useEffect(() => {
    mounted.current = true;
    const controllers = requests.current;
    return () => {
      mounted.current = false;
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  function report(error: unknown) {
    toast.error(getApiError(error));
    if (axios.isAxiosError(error) && error.response?.status === 401)
      router.replace("/login");
  }
  function updateCards(id: string, patch: Partial<AssistantMessage>) {
    if (mounted.current)
      setMessages((current) =>
        current.map((message) =>
          message.id === id && message.kind === "assistant"
            ? { ...message, ...patch }
            : message,
        ),
      );
  }
  async function loadCards(
    id: string,
    ids: string[],
    scope: ChatLocation,
    signal?: AbortSignal,
  ) {
    if (cardJobs.current.has(id)) return;
    cardJobs.current.add(id);
    const controller = signal ? undefined : new AbortController();
    if (controller) requests.current.add(controller);
    const cardSignal = signal ?? controller!.signal;
    updateCards(id, { storeStatus: "loading" });
    try {
      const result = await hydrateStores(
        ids,
        { ...scope, categoryIds: [] },
        cardSignal,
      );
      const { stores } = chatStoresSchema.parse(result);
      const allowed = new Set(ids);
      if (
        new Set(stores.map((store) => store.id)).size !== stores.length ||
        stores.some(
          (store) =>
            !allowed.has(store.id) || store.distanceKm > scope.radiusKm,
        )
      )
        throw new Error("Invalid store response");
      if (!cardSignal.aborted)
        updateCards(id, {
          stores,
          storeStatus: stores.length === ids.length ? "complete" : "partial",
        });
    } catch (error) {
      updateCards(id, { storeStatus: "error" });
      if (!cardSignal.aborted && mounted.current) report(error);
    } finally {
      cardJobs.current.delete(id);
      if (controller) requests.current.delete(controller);
    }
  }
  async function send(text: string, retryId?: string) {
    if (busy.current) return;
    busy.current = true;
    const controller = new AbortController();
    activeRequest.current = controller;
    requests.current.add(controller);
    setPending(true);
    setFindingLocation(true);
    const id = retryId ?? crypto.randomUUID();
    if (retryId)
      setMessages((current) =>
        current.map((message) =>
          message.id === id && message.kind === "user"
            ? { ...message, status: "pending", location: undefined }
            : message,
        ),
      );
    else
      setMessages((current) => [
        ...current,
        { id, kind: "user", text, status: "pending" },
      ]);
    form.reset();
    try {
      let scope: ChatLocation | undefined;
      try {
        scope = await currentChatLocation(
          AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
        );
        locationWarningShown.current = false;
      } catch {
        if (controller.signal.aborted) throw new axios.CanceledError();
        if (mounted.current && !locationWarningShown.current) {
          locationWarningShown.current = true;
          toast.info("ใช้ตำแหน่งปัจจุบันไม่ได้", {
            description:
              "ยังคุยทั่วไปได้ หากต้องการร้านใกล้คุณ กรุณาอนุญาตตำแหน่งในเบราว์เซอร์แล้วลองส่งอีกครั้ง",
          });
        }
      }
      if (!mounted.current) return;
      if (controller.signal.aborted) throw new axios.CanceledError();
      setFindingLocation(false);
      setMessages((current) =>
        current.map((message) =>
          message.id === id && message.kind === "user"
            ? { ...message, location: scope }
            : message,
        ),
      );
      const result = await sendChat(
        { message: text, ...(scope ? { location: scope } : {}) },
        controller.signal,
      );
      if (!mounted.current) return;
      if (controller.signal.aborted) throw new axios.CanceledError();
      const replyId = crypto.randomUUID();
      setMessages((current) => [
        ...current.map((message) =>
          message.id === id && message.kind === "user"
            ? { ...message, status: "sent" as const }
            : message,
        ),
        {
          id: replyId,
          kind: "assistant",
          text: result.reply,
          sources: result.sources,
          storeIds: result.storeIds,
          location: scope,
          stores: [],
          storeStatus: result.storeIds.length ? "loading" : "complete",
        },
      ]);
      if (result.storeIds.length && scope)
        await loadCards(replyId, result.storeIds, scope, controller.signal);
    } catch (error) {
      if (!mounted.current) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === id && message.kind === "user"
            ? {
                ...message,
                status: controller.signal.aborted ? "cancelled" : "failed",
              }
            : message,
        ),
      );
      if (!controller.signal.aborted) report(error);
    } finally {
      requests.current.delete(controller);
      if (activeRequest.current === controller) activeRequest.current = null;
      busy.current = false;
      if (mounted.current) {
        setPending(false);
        setFindingLocation(false);
      }
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-muted/50">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col bg-background shadow-sm sm:border-x">
        <header
          className="flex shrink-0 items-center gap-3 px-4 py-4"
          style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
        >
          <Link
            href="/wallet"
            aria-label="กลับไปกระเป๋าเงิน"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight">
              ผู้ช่วย AI
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              THAI Please · ร้านและการใช้จ่าย
            </p>
          </div>
        </header>
        <main
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-width:thin] sm:px-5"
          aria-label="คุยกับผู้ช่วย AI"
        >
          {!messages.length ? (
            <section className="px-1 pb-4 pt-7">
              <h2 className="text-3xl font-semibold leading-snug tracking-tight">
                วันนี้อยากลอง
                <br />
                ร้านแบบไหน?
              </h2>
              <div className="mt-7 grid grid-cols-2 gap-3">
                {starters.map((starter) => (
                  <button
                    type="button"
                    key={starter.title}
                    onClick={() => void send(starter.message)}
                    disabled={pending}
                    aria-label={`ส่งข้อความ: ${starter.message}`}
                    className="group flex min-h-28 flex-col items-start justify-between rounded-2xl border bg-card p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <starter.icon
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="mt-3 flex w-full items-center justify-between gap-1 text-sm font-medium">
                      {starter.title}
                      <ArrowUpRight
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div
              role="log"
              aria-label="บทสนทนา"
              aria-live="polite"
              aria-relevant="additions"
              className="space-y-6"
            >
              {messages.map((message) =>
                message.kind === "user" ? (
                  <article key={message.id} className="ml-auto max-w-[88%]">
                    <span className="sr-only">คุณ: </span>
                    <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground">
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {message.text}
                      </p>
                    </div>
                    {message.location && (
                      <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
                        รัศมี {message.location.radiusKm} กม.
                        จากตำแหน่งปัจจุบันขณะส่ง
                      </p>
                    )}
                    {(message.status === "failed" ||
                      message.status === "cancelled") && (
                      <div className="mt-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <span>
                          {message.status === "cancelled"
                            ? "หยุดรอคำตอบแล้ว"
                            : "ส่งไม่สำเร็จ"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 text-xs"
                          disabled={pending}
                          onClick={() => void send(message.text, message.id)}
                        >
                          <RefreshCw className="size-3" />
                          ลองส่งอีกครั้ง
                        </Button>
                      </div>
                    )}
                  </article>
                ) : (
                  <article key={message.id} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-muted">
                        <Bot className="size-4" aria-hidden="true" />
                      </span>
                      ผู้ช่วย AI
                    </div>
                    <div className="rounded-2xl rounded-tl-md border bg-muted/25 px-4 py-3 text-sm leading-7">
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {message.text}
                      </p>
                    </div>
                    {message.sources.length > 0 && (
                      <section
                        aria-label="แหล่งข้อมูลอ้างอิง"
                        className="space-y-2"
                      >
                        <h3 className="text-xs font-medium text-muted-foreground">
                          แหล่งข้อมูลอ้างอิง
                        </h3>
                        {message.sources.map((source, index) => (
                          <a
                            key={`${index}-${source.url}`}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors hover:bg-muted"
                          >
                            <span className="text-muted-foreground">
                              [{index + 1}]
                            </span>
                            <span className="min-w-0 flex-1 break-words">
                              {source.title || new URL(source.url).hostname}
                            </span>
                            <ExternalLink
                              className="size-3 shrink-0"
                              aria-label="เปิดแท็บใหม่"
                            />
                          </a>
                        ))}
                      </section>
                    )}
                    {message.storeIds.length > 0 && (
                      <section aria-label="ร้านที่แนะนำ" className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">
                            ร้านที่อาจถูกใจคุณ
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {message.stores.length} ร้าน
                          </span>
                        </div>
                        {message.storeStatus === "loading" && (
                          <div
                            role="status"
                            className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground"
                          >
                            <LoaderCircle
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                            กำลังโหลดร้านแนะนำ…
                          </div>
                        )}
                        {message.stores.map((store) => (
                          <RecommendedStoreCard key={store.id} store={store} />
                        ))}
                        {(message.storeStatus === "error" ||
                          message.storeStatus === "partial") && (
                          <div className="rounded-xl border border-dashed p-3">
                            <p className="text-xs leading-6 text-muted-foreground">
                              {message.storeStatus === "error"
                                ? "โหลดข้อมูลร้านไม่สำเร็จ แต่ยังอ่านคำตอบด้านบนได้"
                                : "บางร้านไม่อยู่ในขอบเขตหรือไม่พร้อมแสดงแล้ว"}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-2 h-10 text-xs"
                              disabled={pending || !message.location}
                              onClick={() => {
                                if (message.location)
                                  void loadCards(
                                    message.id,
                                    message.storeIds,
                                    message.location,
                                  );
                              }}
                            >
                              <RefreshCw className="size-3" />
                              โหลดข้อมูลร้านอีกครั้ง
                            </Button>
                          </div>
                        )}
                        {message.stores.length > 0 && (
                          <p className="text-[11px] leading-5 text-muted-foreground">
                            ระยะทางเป็นระยะเส้นตรง ·
                            ร้านอาจเกี่ยวข้องกับสิ่งที่หา โปรดตรวจสอบเมนูกับร้าน
                          </p>
                        )}
                      </section>
                    )}
                  </article>
                ),
              )}
            </div>
          )}
          {pending &&
            !messages.some(
              (message) =>
                message.kind === "assistant" &&
                message.storeStatus === "loading",
            ) && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                {findingLocation
                  ? "กำลังหาตำแหน่งปัจจุบัน…"
                  : "กำลังคิดและค้นหาข้อมูล…"}
              </div>
            )}
          <div ref={bottom} />
        </main>
        <footer
          className="shrink-0 border-t bg-background px-4 pt-3"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-end gap-2 rounded-2xl border bg-muted/30 p-2">
            <form
              aria-label="ส่งข้อความหาผู้ช่วย AI"
              className="flex min-w-0 flex-1 items-end gap-2"
              onSubmit={(event) => {
                void form.handleSubmit(
                  ({ message }) => send(message),
                  () => toast.error("กรุณาพิมพ์ข้อความ 1–2,000 ตัวอักษร"),
                )(event);
              }}
            >
              <label htmlFor="ai-message" className="sr-only">
                ข้อความถึงผู้ช่วย AI
              </label>
              <Textarea
                {...form.register("message")}
                id="ai-message"
                placeholder="พิมพ์สิ่งที่อยากหา…"
                maxLength={2000}
                rows={1}
                readOnly={pending}
                className="max-h-32 min-h-11 resize-none border-0 bg-transparent px-2 py-2.5 text-base leading-6 shadow-none focus-visible:ring-0"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    if (!pending) event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              {pending ? (
                <Button
                  type="button"
                  className="size-11 rounded-xl"
                  aria-label="หยุดรอคำตอบ"
                  onClick={() => activeRequest.current?.abort()}
                >
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="size-11 rounded-xl"
                  disabled={!draft.trim()}
                  aria-label="ส่งข้อความ"
                >
                  <Send className="size-4" />
                </Button>
              )}
            </form>
          </div>
          <p className="mt-2 text-right text-[10px] leading-5 text-muted-foreground tabular-nums">
            {draft.length.toLocaleString("th-TH")} / 2,000 ตัวอักษร
          </p>
        </footer>
      </div>
    </div>
  );
}
