# หมายเหตุสำหรับปรับภาพเอง

อัปเดตขอบเขต KPI: ใช้ข้อมูลจำลอง 1 ชุมชน ผู้ใช้ 100 คน ร้านค้า 20 ร้าน ระยะเวลา 1 เดือน ภาพ Dashboard ให้เหลือ 3 KPI ได้แก่ ร้านที่ได้ลูกค้าใหม่ 12 ร้าน สัดส่วนยอดซื้อสู่ร้านเล็ก 60% (30,000/50,000 บาท) และอัตราทำ Main Quest สำเร็จ 50% (40/80 ผู้ซื้อที่ใช้งานจริง) แสดงรายงาน FR-G03 แยก: งบ 10,000 มอบ 4,000 ใช้สุทธิ 3,000 ยังใช้ได้ 1,000 หมดอายุ 0 และงบยังไม่จัดสรร 6,000 บาท ตัด AI Conversion และตัวเลขระดับล้านออก ข้อมูลใน script ปรับแล้วแต่ยังไม่สร้างภาพใหม่

คงไฟล์ภาพทั้งหมดตามคำขอ ยังไม่ได้เรียก script สร้างภาพใหม่

| ภาพ | จุดที่ต้องแก้ |
| --- | --- |
| `images/use-case-diagram.png` | คนขายเหลือ 3 use cases: ตัดดูยอดขาย/ลูกค้าใหม่ แล้วย้ายดูเกณฑ์ Tiered Coins เป็น FR-S03; รัฐเหลือ 4 use cases: ตัดเปรียบเทียบยอดซื้อ/ประวัติแก้กติกา; FR-G03 เพิ่มค่าใช้จ่าย Main Quest รายเดือน |
| `images/er-core.png` | ตาม `01-core.sql`: แยก base_subsidy_used/reward_subsidy_used, subsidy_used เป็น generated column; เพิ่ม created_at/refunded_at และคีย์ร่วมตรวจเจ้าของ/บทบาทใน users/shops/wallets/purchases/money_entries |
| `images/er-rewards.png` | ตาม `02-rewards.sql`: ตัด AUDIT_EVENTS และเส้นที่เกี่ยวข้อง; กติกาใช้ minimum_purchase/low_sales_threshold/sales_window_days และอัตรา Coins ชัดเจนแทน tier_criteria/new_store_min/new_store_max/change_reason; เดือนเพิ่ม coin_target/reward_amount; Coins เพิ่ม reversed_at; grant ไม่มี status ซ้ำกับเวลาหมดอายุ; เพิ่ม view ค่าใช้จ่ายรายเดือน |
| `images/system-architecture.png` | เปลี่ยนโมดูล Audit เป็นงานตามรอบและรายงานค่าใช้จ่าย Main Quest; ตัด Audit ออกจากกลุ่มตาราง |
| `images/social-impact-dashboard.png` | เพิ่มงบ วงเงินมอบ ใช้สุทธิ คงเหลือ หมดอายุ และงบยังไม่จัดสรรรายเดือน; ตัดตัวเลขเปรียบเทียบกับเดือนก่อน/ก่อนมีระบบ |
| `images/sequence-diagram.png` | ตรวจชื่อฟิลด์และการแยกสิทธิพื้นฐาน/รางวัลตาม SQL; หากแสดงคืนเงินให้ระบุคืนเต็มจำนวน ถอน Coins และไม่ต่ออายุรางวัล |

ข้อมูล use case ใน script ปรับแล้ว แต่ script สร้าง ER ยังต้องจัดตำแหน่งและปรับ field lists ตาม SQL ก่อน render ภาพอีกครั้ง
