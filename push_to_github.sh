#!/bin/bash
# MCU Council RSVP - Push to GitHub Script

echo "======================================================="
echo "   MCU Council RSVP - ระบบสำรองข้อมูลขึ้น GitHub"
echo "======================================================="
echo ""

# ตรวจสอบสถานะไฟล์
echo "[1/4] ตรวจสอบสถานะไฟล์ที่มีการเปลี่ยนแปลง..."
git status -s
echo ""

# เพิ่มไฟล์ทั้งหมด
echo "[2/4] กำลังจัดเตรียมไฟล์ (git add .)..."
git add .
echo ""

# รับข้อความ Commit
read -p "[3/4] ระบุข้อความ Commit (กด Enter เพื่อใช้ค่าเริ่มต้น): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="chore: update and sync project files to GitHub"
fi

git commit -m "$commit_msg"
echo ""

# ส่งขึ้น GitHub
echo "[4/4] กำลัง Push ข้อมูลขึ้น GitHub (origin main)..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================================="
    echo " [SUCCESS] สำรองข้อมูลขึ้น GitHub สำเร็จเรียบร้อยแล้ว!"
    echo " Repository: https://github.com/Gunne2JunioR/MCU-Council-RSVP.git"
    echo "======================================================="
else
    echo ""
    echo "======================================================="
    echo " [ERROR] การ Push ล้มเหลว!"
    echo " โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือการยืนยันตัวตน GitHub"
    echo "======================================================="
fi
