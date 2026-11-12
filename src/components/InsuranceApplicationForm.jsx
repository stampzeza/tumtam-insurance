import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck,
  UserRound, HeartPulse, CreditCard, BriefcaseBusiness,
  MapPin, Users, ClipboardCheck, FileText
} from "lucide-react";

const initialData = {
  // ผู้สมัคร
  full_name: "",
  id_card: "",
  laser_id: "",
  date_of_birth: "",
  id_expire_date: "",
  nationality: "ไทย",
  phone_number: "",
  email: "",
  weight: "",
  height: "",
  disease: "",
  hospital_history: "",

  // การชำระเงิน
  payment_method: "",
  payment_frequency: "",

  // อาชีพ
  occupation: "",
  company: "",
  work_address: "",
  work_phone: "",
  position: "",
  job_description: "",
  annual_income: "",

  // ที่อยู่
  current_address: {
    house_no: "", moo: "", soi: "", road: "",
    sub_district: "", district: "", province: "", postal_code: ""
  },
  same_address: false,
  house_address: {
    house_no: "", moo: "", soi: "", road: "",
    sub_district: "", district: "", province: "", postal_code: ""
  },

  // ผู้รับผลประโยชน์
  beneficiaries: [],

  // การยินยอม
  terms_accepted: false,
  privacy_accepted: false,
  terms_version: "2026-11-12",
  privacy_version: "2026-11-12"
};

const steps = [
  { title: "ข้อมูลส่วนตัว", icon: UserRound },
  { title: "การชำระเบี้ย", icon: CreditCard },
  { title: "ข้อมูลอาชีพ", icon: BriefcaseBusiness },
  { title: "ที่อยู่", icon: MapPin },
  { title: "ผู้รับผลประโยชน์", icon: Users },
  { title: "ตรวจสอบข้อมูล", icon: ClipboardCheck },
  { title: "ยืนยันและส่งใบสมัคร", icon: FileText }
];

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";
const requiredMark = <span className="ml-1 text-red-500">*</span>;

function Field({ label, required = false, children, hint }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}{required && requiredMark}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, type = "text", ...props }) {
  return (
    <input
      {...props}
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${props.className || ""}`}
    />
  );
}

function TextArea({ value, onChange, ...props }) {
  return (
    <textarea
      {...props}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`${inputClass} resize-y ${props.className || ""}`}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = "กรุณาเลือก" }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

function AddressFields({ value, onChange, prefix }) {
  const fields = [
    ["house_no", "บ้านเลขที่", true],
    ["moo", "หมู่", false],
    ["soi", "ซอย", false],
    ["road", "ถนน", false],
    ["sub_district", "ตำบล / แขวง", true],
    ["district", "อำเภอ / เขต", true],
    ["province", "จังหวัด", true],
    ["postal_code", "รหัสไปรษณีย์", true]
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(([key, label, required]) => (
        <Field key={`${prefix}-${key}`} label={label} required={required}>
          <TextInput
            value={value[key]}
            onChange={(v) => onChange({ ...value, [key]: v })}
            inputMode={key === "postal_code" ? "numeric" : undefined}
            maxLength={key === "postal_code" ? 5 : undefined}
            placeholder={key === "postal_code" ? "เช่น 50000" : ""}
          />
        </Field>
      ))}
    </div>
  );
}

export default function InsuranceApplicationForm({
  selectedPlan,
  apiUrl,
  onClose,
  onSuccess,
  successMsg
}) {
  const [data, setData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setData((prev) => ({ ...prev, [key]: value }));
  const currentAddress = data.current_address;
  const houseAddress = data.same_address ? currentAddress : data.house_address;

  const reviewRows = useMemo(() => [
    ["ชื่อ-นามสกุล", data.full_name],
    ["เลขบัตรประชาชน", data.id_card],
    ["เลขหลังบัตร", data.laser_id],
    ["วันเกิด", data.date_of_birth],
    ["วันหมดอายุบัตร", data.id_expire_date],
    ["สัญชาติ", data.nationality],
    ["เบอร์โทรศัพท์", data.phone_number],
    ["อีเมล", data.email],
    ["น้ำหนัก", data.weight ? `${data.weight} กก.` : ""],
    ["ส่วนสูง", data.height ? `${data.height} ซม.` : ""],
    ["โรคประจำตัว", data.disease],
    ["ประวัติการรักษา", data.hospital_history],
    ["วิธีชำระเบี้ย", data.payment_method],
    ["ความถี่ชำระเบี้ย", data.payment_frequency],
    ["อาชีพ", data.occupation],
    ["สถานที่ทำงาน", data.company],
    ["ตำแหน่ง", data.position],
    ["ลักษณะงาน", data.job_description],
    ["รายได้ต่อปี", data.annual_income],
    ["ที่อยู่ปัจจุบัน", Object.values(currentAddress).filter(Boolean).join(" ")],
    ["ที่อยู่ทะเบียนบ้าน", Object.values(houseAddress).filter(Boolean).join(" ")],
    ["ผู้รับผลประโยชน์", data.beneficiaries.map((b) => b.full_name).filter(Boolean).join(", ")]
  ], [data, currentAddress, houseAddress]);

  const validateStep = () => {
    const required = (keys, message) => {
      const missing = keys.some((key) => !String(data[key] ?? "").trim());
      if (missing) {
        setError(message);
        return false;
      }
      return true;
    };

    if (step === 0) {
      if (!required(
        ["full_name", "id_card", "laser_id", "date_of_birth", "id_expire_date",
          "nationality", "phone_number", "email", "weight", "height", "disease"],
        "กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน"
      )) return false;

      if (!/^\d{13}$/.test(data.id_card.replace(/\D/g, ""))) {
        setError("เลขบัตรประชาชนต้องมี 13 หลัก");
        return false;
      }
      if (!/^\d{9,10}$/.test(data.phone_number.replace(/\D/g, ""))) {
        setError("กรุณาตรวจสอบเบอร์โทรศัพท์");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setError("กรุณากรอกอีเมลให้ถูกต้อง");
        return false;
      }
      if (Number(data.weight) <= 0 || Number(data.height) <= 0) {
        setError("กรุณาตรวจสอบน้ำหนักและส่วนสูง");
        return false;
      }
    }

    if (step === 1 && (!data.payment_method || !data.payment_frequency)) {
      setError("กรุณาเลือกวิธีและความถี่ในการชำระเบี้ย");
      return false;
    }

    if (step === 2) {
      if (!required(
        ["occupation", "company", "work_address", "work_phone", "position",
          "job_description", "annual_income"],
        "กรุณากรอกข้อมูลอาชีพให้ครบถ้วน"
      )) return false;
      if (Number(data.annual_income) <= 0) {
        setError("กรุณากรอกรายได้ต่อปีให้มากกว่า 0");
        return false;
      }
    }

    if (step === 3) {
      const a = data.current_address;
      const currentRequired = ["house_no", "sub_district", "district", "province", "postal_code"];
      if (currentRequired.some((key) => !String(a[key] || "").trim())) {
        setError("กรุณากรอกที่อยู่ปัจจุบันให้ครบถ้วน");
        return false;
      }
      if (!/^\d{5}$/.test(a.postal_code)) {
        setError("รหัสไปรษณีย์ต้องมี 5 หลัก");
        return false;
      }
      if (!data.same_address) {
        const h = data.house_address;
        if (currentRequired.some((key) => !String(h[key] || "").trim())) {
          setError("กรุณากรอกที่อยู่ตามทะเบียนบ้านให้ครบถ้วน หรือเลือกใช้ที่อยู่เดียวกัน");
          return false;
        }
        if (!/^\d{5}$/.test(h.postal_code)) {
          setError("รหัสไปรษณีย์ตามทะเบียนบ้านต้องมี 5 หลัก");
          return false;
        }
      }
    }

    if (step === 4) {
      const invalid = data.beneficiaries.some((b) =>
        !b.full_name.trim() || !b.relationship.trim()
      );
      if (invalid) {
        setError("กรุณากรอกชื่อและความสัมพันธ์ของผู้รับผลประโยชน์ให้ครบ หรือเอารายการที่ยังไม่กรอกออก");
        return false;
      }
    }

    setError("");
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const addBeneficiary = () => {
    update("beneficiaries", [
      ...data.beneficiaries,
      { full_name: "", relationship: "", percentage: "" }
    ]);
  };

  const updateBeneficiary = (index, key, value) => {
    update("beneficiaries", data.beneficiaries.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    ));
  };

  const removeBeneficiary = (index) => {
    update("beneficiaries", data.beneficiaries.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!data.terms_accepted || !data.privacy_accepted) {
      setError("กรุณายืนยันการรับทราบเงื่อนไขและประกาศความเป็นส่วนตัว");
      return;
    }

    setSubmitting(true);
    setError("");

    // คงชื่อ field เดิมที่ API ใช้อยู่ และแนบข้อมูลแบบฟอร์มฉบับเต็มเพิ่มใน application_data
    const payload = {
      plan_id: selectedPlan?.id,
      full_name: data.full_name,
      phone_number: data.phone_number,
      line_id: "-",
      date_of_birth: data.date_of_birth,
      application_data: {
        ...data,
        house_address: houseAddress,
        submitted_from: "tumtaminsure_web"
      }
    };

    try {
      await axios.post(`${apiUrl}/api/leads`, payload);
      onSuccess?.("ส่งข้อมูลใบสมัครเรียบร้อยแล้ว เจ้าหน้าที่ได้รับข้อมูลเบื้องต้นแล้ว และจะติดต่อกลับเพื่อตรวจสอบขั้นตอนต่อไป");
    } catch (err) {
      console.error("Submit application failed:", err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <SectionTitle icon={UserRound} title="ข้อมูลผู้สมัครและสุขภาพ" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ชื่อ - นามสกุล" required>
              <TextInput value={data.full_name} onChange={(v) => update("full_name", v)} placeholder="ชื่อและนามสกุลตามบัตรประชาชน" />
            </Field>
            <Field label="เลขบัตรประชาชน" required>
              <TextInput value={data.id_card} onChange={(v) => update("id_card", v.replace(/\D/g, "").slice(0, 13))} inputMode="numeric" maxLength={13} placeholder="13 หลัก" />
            </Field>
            <Field label="เลขหลังบัตรประชาชน (Laser ID)" required>
              <TextInput value={data.laser_id} onChange={(v) => update("laser_id", v.toUpperCase())} placeholder="เช่น ME1-1234567-89" />
            </Field>
            <Field label="วันเดือนปีเกิด" required>
              <TextInput type="date" value={data.date_of_birth} onChange={(v) => update("date_of_birth", v)} />
            </Field>
            <Field label="วันหมดอายุบัตรประชาชน" required>
              <TextInput type="date" value={data.id_expire_date} onChange={(v) => update("id_expire_date", v)} />
            </Field>
            <Field label="สัญชาติ" required>
              <TextInput value={data.nationality} onChange={(v) => update("nationality", v)} />
            </Field>
            <Field label="เบอร์โทรศัพท์" required>
              <TextInput type="tel" value={data.phone_number} onChange={(v) => update("phone_number", v.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} placeholder="08xxxxxxxx" />
            </Field>
            <Field label="อีเมล" required>
              <TextInput type="email" value={data.email} onChange={(v) => update("email", v)} placeholder="example@email.com" />
            </Field>
            <Field label="น้ำหนัก (กก.)" required>
              <TextInput type="number" value={data.weight} onChange={(v) => update("weight", v)} min="1" />
            </Field>
            <Field label="ส่วนสูง (ซม.)" required>
              <TextInput type="number" value={data.height} onChange={(v) => update("height", v)} min="1" />
            </Field>
          </div>
          <Field label="โรคประจำตัว" required hint="หากไม่มี กรุณาระบุว่า “ไม่มี”">
            <TextArea value={data.disease} onChange={(v) => update("disease", v)} placeholder="ระบุโรคประจำตัว หรือพิมพ์ว่า ไม่มี" />
          </Field>
          <Field label="ประวัติการรักษาในโรงพยาบาล" hint="หากไม่มี กรุณาระบุว่า “ไม่มี”">
            <TextArea value={data.hospital_history} onChange={(v) => update("hospital_history", v)} placeholder="ระบุประวัติการรักษา (ถ้ามี)" />
          </Field>
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-800">
            ข้อมูลบัตรประชาชนและสุขภาพเป็นข้อมูลละเอียดอ่อน โปรดกรอกเมื่อพร้อมและตรวจสอบความถูกต้องก่อนส่ง
          </p>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-5">
          <SectionTitle icon={CreditCard} title="วิธีการและความถี่ในการชำระเบี้ย" />
          <div>
            <p className={labelClass}>ช่องทางการชำระเงิน{requiredMark}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["QR Code ออนไลน์", "📱", "ชำระผ่าน QR Code"],
                ["บัตรเครดิต", "💳", "ชำระผ่านบัตรเครดิต"]
              ].map(([value, icon, desc]) => (
                <button type="button" key={value} onClick={() => update("payment_method", value)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${data.payment_method === value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                  <span className="text-2xl">{icon}</span>
                  <span className="mt-2 block font-bold text-gray-800">{value}</span>
                  <span className="mt-1 block text-xs text-gray-500">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className={labelClass}>ความถี่ในการชำระเบี้ย{requiredMark}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["รายปี", "ราย 6 เดือน", "ราย 3 เดือน", "รายเดือน"].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => update("payment_frequency", value)}
                  className={`rounded-xl border-2 px-3 py-4 text-sm font-semibold ${
                    data.payment_frequency === value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs leading-6 text-gray-500">
            การเลือกวิธีชำระในขั้นตอนนี้เป็นการแจ้งความประสงค์เบื้องต้น ไม่ใช่การตัดเงินหรือยืนยันการชำระเบี้ย
          </p>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <SectionTitle icon={BriefcaseBusiness} title="ข้อมูลการทำงาน" />
          <Field label="อาชีพปัจจุบัน" required>
            <SelectInput value={data.occupation} onChange={(v) => update("occupation", v)}
              options={["พนักงานออฟฟิศ", "ค้าขาย/ธุรกิจส่วนตัว", "ข้าราชการ/รัฐวิสาหกิจ", "รับจ้าง/ฟรีแลนซ์", "อื่นๆ"]} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="สถานที่ทำงาน" required>
              <TextInput value={data.company} onChange={(v) => update("company", v)} placeholder="ชื่อบริษัท / สถานที่ทำงาน" />
            </Field>
            <Field label="เบอร์โทรศัพท์ที่ทำงาน" required>
              <TextInput type="tel" value={data.work_phone} onChange={(v) => update("work_phone", v)} placeholder="เบอร์โทรศัพท์ที่ทำงาน" />
            </Field>
            <Field label="ตำแหน่ง" required>
              <TextInput value={data.position} onChange={(v) => update("position", v)} />
            </Field>
            <Field label="รายได้ต่อปี (บาท)" required>
              <TextInput type="number" value={data.annual_income} onChange={(v) => update("annual_income", v)} min="1" />
            </Field>
          </div>
          <Field label="ที่อยู่ที่ทำงาน" required>
            <TextArea value={data.work_address} onChange={(v) => update("work_address", v)} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
          </Field>
          <Field label="ลักษณะงาน" required>
            <TextArea value={data.job_description} onChange={(v) => update("job_description", v)} placeholder="อธิบายลักษณะงานโดยย่อ" />
          </Field>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <SectionTitle icon={MapPin} title="ที่อยู่สำหรับติดต่อ" />
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800">ที่อยู่ปัจจุบัน</h4>
            <AddressFields prefix="current" value={data.current_address}
              onChange={(v) => update("current_address", v)} />
          </div>
          <div className="border-t pt-5">
            <h4 className="mb-3 font-bold text-gray-800">ที่อยู่ตามทะเบียนบ้าน</h4>
            <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
              <input type="checkbox" checked={data.same_address}
                onChange={(e) => update("same_address", e.target.checked)}
                className="h-5 w-5 accent-blue-600" />
              ใช้ที่อยู่ปัจจุบันเป็นที่อยู่ตามทะเบียนบ้าน
            </label>
            {!data.same_address && (
              <AddressFields prefix="house" value={data.house_address}
                onChange={(v) => update("house_address", v)} />
            )}
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-5">
          <SectionTitle icon={Users} title="ข้อมูลผู้รับผลประโยชน์" />
          <p className="text-sm leading-6 text-gray-600">
            เพิ่มรายชื่อผู้รับผลประโยชน์ตามข้อมูลที่ต้องการแจ้งในใบสมัคร หากยังไม่พร้อมสามารถข้ามขั้นตอนนี้ได้
          </p>
          {data.beneficiaries.map((item, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">ผู้รับผลประโยชน์คนที่ {index + 1}</span>
                <button type="button" onClick={() => removeBeneficiary(index)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700">ลบ</button>
              </div>
              <Field label="ชื่อ - นามสกุล" required>
                <TextInput value={item.full_name} onChange={(v) => updateBeneficiary(index, "full_name", v)} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="ความสัมพันธ์" required>
                  <TextInput value={item.relationship} onChange={(v) => updateBeneficiary(index, "relationship", v)} placeholder="เช่น บิดา / มารดา / คู่สมรส" />
                </Field>
                <Field label="สัดส่วน (%)" hint="ถ้าทราบ">
                  <TextInput type="number" min="0" max="100" value={item.percentage} onChange={(v) => updateBeneficiary(index, "percentage", v)} />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" onClick={addBeneficiary}
            className="w-full rounded-xl border-2 border-dashed border-blue-300 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
            + เพิ่มผู้รับผลประโยชน์
          </button>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="space-y-4">
          <SectionTitle icon={ClipboardCheck} title="ตรวจสอบข้อมูลใบสมัคร" />
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-700">แผนประกันที่สนใจ</p>
            <p className="mt-1 font-bold text-blue-950">{selectedPlan?.title || "-"}</p>
          </div>
          {reviewRows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 border-b border-gray-100 py-2 sm:grid-cols-[170px_1fr]">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="break-words text-sm font-medium text-gray-800">{value || "-"}</span>
            </div>
          ))}
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-800">
            กรุณาตรวจสอบข้อมูลทุกส่วนให้ถูกต้อง โดยเฉพาะข้อมูลส่วนบุคคลและข้อมูลสุขภาพ ก่อนดำเนินการต่อ
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <SectionTitle icon={ShieldCheck} title="เงื่อนไขและการรับทราบประกาศความเป็นส่วนตัว" />
        <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700">
          <p className="mb-2 font-bold">การรับทราบเงื่อนไขการสมัคร</p>
          <p>
            ข้าพเจ้ารับรองว่าข้อมูลที่กรอกเป็นความจริงและครบถ้วน เข้าใจว่าการส่งใบสมัครเป็นเพียงการยื่นข้อมูลเพื่อพิจารณา
            การรับประกันภัยขึ้นอยู่กับหลักเกณฑ์และผลการพิจารณาของบริษัทประกันภัย
          </p>
          <p className="mb-2 mt-4 font-bold">ประกาศความเป็นส่วนตัว (Privacy Notice)</p>
          <p>
            ข้าพเจ้ารับทราบว่าข้อมูลส่วนบุคคลและข้อมูลสุขภาพที่ให้ไว้จะถูกนำไปใช้เพื่อประสานงาน ดำเนินการสมัคร
            ประเมินความเสี่ยง และติดต่อเกี่ยวกับคำขอเอาประกันภัย ตามประกาศความเป็นส่วนตัวและกฎหมายที่เกี่ยวข้อง
          </p>
          <p className="mt-3 text-xs text-gray-500">
            ข้อความนี้เป็นข้อความแสดงการรับทราบเบื้องต้น ควรแทนที่/เชื่อมโยงกับเอกสารเงื่อนไขและ Privacy Notice
            ฉบับที่บริษัทอนุมัติก่อนเปิดใช้งานจริง
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
          <input type="checkbox" checked={data.terms_accepted}
            onChange={(e) => update("terms_accepted", e.target.checked)}
            className="mt-1 h-5 w-5 accent-blue-600" />
          <span className="text-sm leading-6 text-gray-700">
            ข้าพเจ้ายืนยันว่าข้อมูลที่ให้เป็นความจริง และรับทราบเงื่อนไขการสมัครประกันภัย
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4">
          <input type="checkbox" checked={data.privacy_accepted}
            onChange={(e) => update("privacy_accepted", e.target.checked)}
            className="mt-1 h-5 w-5 accent-blue-600" />
          <span className="text-sm leading-6 text-gray-700">
            ข้าพเจ้ารับทราบประกาศความเป็นส่วนตัว (Privacy Notice) เกี่ยวกับการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
          </span>
        </label>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
          <div className="pr-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">แบบฟอร์มสมัครประกันออนไลน์</p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900 sm:text-xl">{selectedPlan?.title}</h2>
            <p className="mt-1 text-xs text-gray-500">ขั้นตอนที่ {step + 1} จาก {steps.length}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิดแบบฟอร์ม"
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-5 py-4 sm:px-7">
          <div className="mb-3 flex gap-1.5">
            {steps.map((item, index) => (
              <div key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-blue-600" : "bg-gray-200"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
            {React.createElement(steps[step].icon, { className: "h-4 w-4" })}
            {steps[step].title}
          </div>
        </div>

        {successMsg ? (
          <div className="p-7 text-center sm:p-10">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h3 className="mt-4 text-xl font-extrabold text-gray-900">ส่งข้อมูลเรียบร้อยแล้ว</h3>
            <p className="mt-3 text-sm leading-7 text-gray-600">{successMsg}</p>
            <button type="button" onClick={onClose}
              className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">
              กลับสู่หน้าหลัก
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="overflow-y-auto px-5 py-5 sm:px-7">
              {renderStep()}
              {error && (
                <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
              <button type="button" onClick={back} disabled={step === 0 || submitting}
                className="inline-flex items-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:invisible">
                <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
              </button>
              {step < steps.length - 1 ? (
                <button type="button" onClick={next}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  ดำเนินการต่อ <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={submitting || !data.terms_accepted || !data.privacy_accepted}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? "กำลังส่งข้อมูล..." : <><CheckCircle2 className="h-4 w-4" /> ยืนยันและส่งใบสมัคร</>}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
      <span className="rounded-xl bg-blue-50 p-2 text-blue-600"><Icon className="h-5 w-5" /></span>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
  );
}
