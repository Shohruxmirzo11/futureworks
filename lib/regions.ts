export const regions = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg’ona viloyati",
  "Jizzax viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Qoraqalpog’iston Respublikasi",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
  "Boshqa davlat",
];

// "+998 90 123-45-67" -> "+998901234567"
export const normalizePhone = (v: string) => v.replace(/[\s\-()]/g, "");

export const isValidPhone = (v: string) => /^\+?[0-9]{9,15}$/.test(normalizePhone(v));

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// lotin harflari (katta va kichik), raqamlar va pastki chiziq; 3-20 belgi (email bo'la olmaydi)
export const isValidUsername = (v: string) => /^[A-Za-z0-9_]{3,20}$/.test(v);
