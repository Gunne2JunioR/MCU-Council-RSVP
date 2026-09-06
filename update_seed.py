import json

# Define the 21 real council members from the official documents
members_data = [
    # --- 13 ท่าน: กรรมการสภามหาวิทยาลัย (ภายใน) ---
    {
        "id": "cm-1", "user_id": "user-chair", "code": "MCU-M-001",
        "title": "สมเด็จพระ", "firstName": "มหาวชิราธิบดี", "lastName": "",
        "position": "นายกสภามหาวิทยาลัย", "org": "สภามหาวิทยาลัย มจร.",
        "role": "นายกสภามหาวิทยาลัย", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0001", "email": "chairperson@mcu.ac.th", "roleType": "chairperson"
    },
    {
        "id": "cm-2", "user_id": "user-rector", "code": "MCU-M-002",
        "title": "พระพรหมบัณฑิต", "firstName": ", ศ.ดร.", "lastName": "",
        "position": "อุปนายกสภามหาวิทยาลัย", "org": "สภามหาวิทยาลัย มจร.",
        "role": "อุปนายกสภามหาวิทยาลัย", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0002", "email": "vicechair@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-3", "user_id": "user-rector-actual", "code": "MCU-M-003",
        "title": "พระพรหมวัชรธีราจารย์", "firstName": ", ศ.ดร.", "lastName": "",
        "position": "อธิการบดี มจร.", "org": "สำนักงานอธิการบดี",
        "role": "อธิการบดี (กรรมการโดยตำแหน่ง)", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0003", "email": "rector@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-4", "user_id": "user-m-4", "code": "MCU-M-004",
        "title": "สมเด็จพระ", "firstName": "วชิรรัตนโมลี", "lastName": "",
        "position": "กรรมการผู้ทรงคุณวุฒิ", "org": "สภามหาวิทยาลัย มจร.",
        "role": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0004", "email": "member04@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-5", "user_id": "user-m-5", "code": "MCU-M-005",
        "title": "สมเด็จพระ", "firstName": "พุฒาจารย์", "lastName": "",
        "position": "กรรมการผู้ทรงคุณวุฒิ", "org": "สภามหาวิทยาลัย มจร.",
        "role": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0005", "email": "member05@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-6", "user_id": "user-m-6", "code": "MCU-M-006",
        "title": "พระพรหม", "firstName": "วชิรปัญญาจารย์", "lastName": "",
        "position": "กรรมการผู้ทรงคุณวุฒิ", "org": "สภามหาวิทยาลัย มจร.",
        "role": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0006", "email": "member06@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-7", "user_id": "user-m-7", "code": "MCU-M-007",
        "title": "พระปัญญาวัชรบัณฑิต", "firstName": ", รศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีฝ่ายวิชาการ", "org": "สำนักงานอธิการบดี",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0007", "email": "academic.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-8", "user_id": "user-m-8", "code": "MCU-M-008",
        "title": "พระราชญาณวัชิรเวที", "firstName": ", ผศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีฝ่ายกิจการนิสิต", "org": "สำนักงานอธิการบดี",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0008", "email": "student.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-9", "user_id": "user-m-9", "code": "MCU-M-009",
        "title": "พระเทพวัชรสารบัณฑิต", "firstName": ", รศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีฝ่ายวางแผนและพัฒนา", "org": "สำนักงานอธิการบดี",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0009", "email": "planning.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-10", "user_id": "user-m-10", "code": "MCU-M-010",
        "title": "พระวัชรพุทธิบัณฑิต", "firstName": ", รศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีวิทยาเขตนครศรีธรรมราช", "org": "วิทยาเขตนครศรีธรรมราช",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-010", "email": "nakhon.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-11", "user_id": "user-m-11", "code": "MCU-M-011",
        "title": "พระศรีรัตโนบล", "firstName": ", ผศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีวิทยาเขตอุบลราชธานี", "org": "วิทยาเขตอุบลราชธานี",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0011", "email": "ubon.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-12", "user_id": "user-m-12", "code": "MCU-M-012",
        "title": "พระสุธีวัชรบัณฑิต", "firstName": ", ผศ.ดร.", "lastName": "",
        "position": "รองอธิการบดีวิทยาเขตเชียงใหม่", "org": "วิทยาเขตเชียงใหม่",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0012", "email": "chiangmai.vp@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-13", "user_id": "user-m-13", "code": "MCU-M-013",
        "title": "พระราชสุทธิวัชรสุธี", "firstName": ", รศ.ดร.", "lastName": "",
        "position": "คณบดีบัณฑิตวิทยาลัย", "org": "บัณฑิตวิทยาลัย มจร.",
        "role": "กรรมการสภามหาวิทยาลัยจากผู้บริหาร", "hasQuorum": True, "hasVoting": True,
        "phone": "081-999-0013", "email": "grad.dean@mcu.ac.th", "roleType": "member"
    },

    # --- 8 ท่าน: กรรมการสภามหาวิทยาลัยโดยตำแหน่งและผู้ทรงคุณวุฒิ ---
    {
        "id": "cm-14", "user_id": "user-m-14", "code": "MCU-M-014",
        "title": "นาย", "firstName": "วันนี", "lastName": "นนท์ศิริ",
        "position": "หัวหน้าผู้ตรวจราชการกระทรวง อว.", "org": "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0014", "email": "wannee@mhesi.go.th", "roleType": "member"
    },
    {
        "id": "cm-15", "user_id": "user-m-15", "code": "MCU-M-015",
        "title": "นางสาว", "firstName": "ปรัชญวรรณ", "lastName": "วนานันท์",
        "position": "ที่ปรึกษาด้านระบบบริหารจัดการศึกษา", "org": "กระทรวงศึกษาธิการ",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0015", "email": "prachayawan@moe.go.th", "roleType": "member"
    },
    {
        "id": "cm-16", "user_id": "user-m-16", "code": "MCU-M-016",
        "title": "นางสาว", "firstName": "วราภรณ์", "lastName": "ตั้งตระกูล",
        "position": "รองเลขาธิการ ก.พ.", "org": "สำนักงานคณะกรรมการข้าราชการพลเรือน (ก.พ.)",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0016", "email": "waraporn.t@ocsc.go.th", "roleType": "member"
    },
    {
        "id": "cm-17", "user_id": "user-m-17", "code": "MCU-M-017",
        "title": "ผศ.", "firstName": "ปารีณา", "lastName": "ศรีวนิชย์",
        "position": "ที่ปรึกษาด้านวิจัยและพัฒนาวิชาการพระพุทธศาสนา", "org": "สำนักงานพระพุทธศาสนาแห่งชาติ",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0017", "email": "pareena@onab.go.th", "roleType": "member"
    },
    {
        "id": "cm-18", "user_id": "user-m-18", "code": "MCU-M-018",
        "title": "นาง", "firstName": "อำภา", "lastName": "พรหมวาทย์",
        "position": "ที่ปรึกษาด้านนโยบายและแผนการศึกษา", "org": "สำนักงานเลขาธิการสภาการศึกษา",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0018", "email": "ampa.p@onec.go.th", "roleType": "member"
    },
    {
        "id": "cm-19", "user_id": "user-m-19", "code": "MCU-M-019",
        "title": "นาย", "firstName": "ภัทรพงศ์", "lastName": "พุ่มผลึก",
        "position": "ผอ.กองจัดทำงบประมาณด้านสังคม (แทน ผอ.สำนักงบประมาณ)", "org": "สำนักงบประมาณ",
        "role": "กรรมการสภามหาวิทยาลัยโดยตำแหน่ง", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0019", "email": "pattarapong@bb.go.th", "roleType": "member"
    },
    {
        "id": "cm-20", "user_id": "user-m-20", "code": "MCU-M-020",
        "title": "ศาสตราจารย์พิเศษ", "firstName": "จำนงค์", "lastName": "ทองประเสริฐ",
        "position": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "org": "สภามหาวิทยาลัย มจร.",
        "role": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0020", "email": "jamnong@mcu.ac.th", "roleType": "member"
    },
    {
        "id": "cm-21", "user_id": "user-m-21", "code": "MCU-M-021",
        "title": "ดร.", "firstName": "กฤษฎา", "lastName": "ดิษบรรจง",
        "position": "ที่ปรึกษาอธิการบดีด้านกฎหมาย", "org": "สำนักงานอธิการบดี มจร.",
        "role": "กรรมการสภามหาวิทยาลัยผู้ทรงคุณวุฒิ", "hasQuorum": True, "hasVoting": True,
        "phone": "081-888-0021", "email": "kritsada@mcu.ac.th", "roleType": "member"
    }
]

print("Members data generated, items:", len(members_data))
