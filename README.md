# Frontend Analytic Yorindo

Frontend untuk **Yorindo Event Management System (EMS)**.

Project ini menangani dua area utama:

- **dashboard internal** untuk admin atau operator
- **public-facing pages** untuk registrasi event dan feedback

README ini fokus pada sisi frontend: struktur aplikasi, routing, state management, integrasi API, dan cara menjalankannya secara lokal.

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Teknologi](#teknologi)
- [Fitur Utama](#fitur-utama)
- [Routing Utama](#routing-utama)
- [Struktur Folder](#struktur-folder)
- [Arsitektur Frontend](#arsitektur-frontend)
- [Alur Data Frontend](#alur-data-frontend)
- [Menjalankan Project](#menjalankan-project)
- [Environment Variables](#environment-variables)
- [Build dan Lint](#build-dan-lint)
- [Catatan Implementasi](#catatan-implementasi)
- [File Referensi Penting](#file-referensi-penting)

## Ringkasan

Frontend ini dibangun untuk mendukung workflow event management dari dua sisi:

- staf internal yang mengelola event, participant, dan analytics
- visitor yang mengisi form registrasi berdasarkan event tertentu

Secara implementasi, aplikasi menggunakan React dengan routing multi-page style melalui `react-router-dom`, state global melalui Redux Toolkit, dan form handling melalui React Hook Form + Zod.

## Teknologi

Stack utama:

- React 19
- TypeScript
- Vite
- React Router
- Redux Toolkit
- React Hook Form
- Zod
- Recharts
- Tailwind CSS
- Radix UI primitives

## Fitur Utama

### Dashboard internal

Kemampuan utama:

- login internal
- melihat daftar event
- membuat, mengubah, dan menghapus event
- melihat detail event
- melihat participant per event
- melihat event analytics
- melihat survey analytics
- melihat feedback analytics

### Public registration

Kemampuan utama:

- mengambil konfigurasi form berdasarkan slug event
- merender form dinamis dari `fixedFields` dan `customQuestions`
- review data sebelum submit final
- mengirim payload registrasi ke backend

### Public feedback

Kemampuan saat ini:

- halaman feedback form sudah tersedia
- tampilan feedback analytics sudah tersedia di dashboard

Catatan:

- integrasi end-to-end public feedback perlu dicek kembali jika akan dijadikan flow produksi utama

## Routing Utama

Beberapa route penting yang aktif saat ini:

### Public routes

- `/`
- `/login`
- `/visitor`
- `/register/:slug`
- `/register/:slug/review`
- `/feedback`
- `/feedback/:slug`

### Dashboard routes

- `/dashboard`
- `/events`
- `/events/create`
- `/events/edit/:id`
- `/events/:eventId`
- `/events/:eventId/participants`
- `/events/:eventId/analytics`
- `/events/:eventId/survey-analytics`
- `/events/:eventId/feedback-analytics`
- `/events/:eventId/registration-form`
- `/events/:eventId/survey-form`

## Struktur Folder

Struktur penting yang paling sering dipakai:

```text
frontend-analytic-yorindo/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |-- context/
|   |-- hooks/
|   |-- layouts/
|   |-- pages/
|   |-- services/
|   |-- store/
|   |-- types/
|   `-- utils/
|-- package.json
`-- vite.config.ts
```

Ringkasan tanggung jawab folder:

- `components/`: reusable UI dan form component
- `layouts/`: shell untuk dashboard atau auth area
- `pages/`: page-level route components
- `services/`: wrapper komunikasi API
- `store/`: Redux slices dan store setup
- `hooks/`: custom hooks untuk auth, event, dan dispatch
- `types/`: type definition frontend
- `utils/`: formatter, validator, dan helper presentasi

## Arsitektur Frontend

### Entry point

Entry point aplikasi ada di:

- `src/main.tsx`
- `src/App.tsx`

`App.tsx` bertindak sebagai root router untuk seluruh aplikasi.

### Layout dan page composition

Frontend memisahkan route berdasarkan konteks tampilan:

- `MainDashboard` untuk area dashboard umum
- `EventDashboard` untuk workspace per event
- public pages untuk registration dan feedback

Dengan pola ini, setiap route mewarisi shell tampilan yang sesuai tanpa perlu mengulang struktur sidebar, topbar, atau container.

### State management

State global utama dikelola dengan Redux Toolkit.

Contoh use case:

- daftar event
- auth persistence
- beberapa state form dan entity lain

Redux dipakai terutama untuk state yang dibutuhkan lintas halaman, sedangkan state lokal halaman tetap memakai React state biasa bila konteksnya sempit.

### API integration

Frontend memakai wrapper API terpusat di `src/services/api.ts`.

Tanggung jawab wrapper ini:

- menentukan base URL
- menyisipkan token auth dari local storage
- menyamakan format hasil request
- mengurangi duplikasi fetch logic antar halaman

Di atas wrapper ini, beberapa page atau slice memanggil endpoint backend melalui thunk atau helper service.

### Form rendering

Public registration memakai `FormBuilder` yang membangun field secara dinamis dari data backend.

Pola utamanya:

1. frontend mengambil konfigurasi form event
2. field aktif digabung dari fixed field dan custom question
3. schema validasi dibangun secara dinamis dengan Zod
4. user submit data ke backend visitor endpoint

Ini membuat frontend bisa melayani event dengan struktur form berbeda tanpa membuat halaman terpisah per event.

## Alur Data Frontend

### 1. Event list flow

1. halaman event memanggil thunk `fetchEvents`
2. thunk mengambil data dari endpoint `/api/v1/events`
3. response dinormalisasi di layer store
4. komponen page menampilkan data yang sudah siap untuk UI

### 2. Registration flow

1. user membuka `/register/:slug`
2. frontend mengambil konfigurasi form builder berdasarkan slug
3. `FormBuilder` merender field dinamis
4. nilai form dipetakan ke fixed field dan custom question
5. frontend submit payload ke endpoint visitor registration

### 3. Analytics flow

1. user membuka event workspace
2. halaman analytics memanggil endpoint backend sesuai tab
3. frontend mengubah response menjadi stat cards, chart, dan list
4. beberapa analytics page memuat AI insight secara manual melalui tombol aksi

## Menjalankan Project

### Prasyarat

- Node.js 20+ disarankan
- backend Yorindo EMS sudah berjalan

### Install dependency

```bash
npm install
```

### Jalankan development server

```bash
npm run dev
```

Default URL:

- `http://localhost:5173`

## Environment Variables

Variable utama yang dipakai frontend:

- `VITE_API_BASE_URL`

Jika tidak diisi, service API default ke:

```text
http://localhost:5000
```

Catatan:

- masih ada bagian tertentu yang memakai pola env berbeda untuk fetch langsung, jadi konsistensi naming env sebaiknya dijaga jika nanti dirapikan lebih lanjut

## Build dan Lint

### Build production

```bash
npm run build
```

### Preview hasil build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Catatan Implementasi

- aplikasi ini bukan lagi template Vite biasa; routing aktif sudah mencakup dashboard dan public pages
- event workspace menjadi pusat navigasi analytics per event
- `FormBuilder` adalah komponen penting karena menjadi jembatan antara konfigurasi backend dan pengalaman registrasi user
- beberapa file lama atau alternatif masih ada di codebase, jadi tidak semua file di folder `pages/` pasti menjadi jalur utama aplikasi
- dokumentasi lama di beberapa file internal bisa saja belum sepenuhnya mengikuti implementasi aktif saat ini

## File Referensi Penting

Jika ingin memahami frontend dengan cepat, mulai dari file berikut:

1. `src/main.tsx`
2. `src/App.tsx`
3. `src/layouts/MainDashboard.tsx`
4. `src/layouts/EventDashboard.tsx`
5. `src/services/api.ts`
6. `src/store/eventSlice.ts`
7. `src/components/FormBuilder.tsx`
8. `src/pages/event-registration/VisitorEventRegistrationPage.tsx`
9. `src/pages/event-management/Events.tsx`
10. `src/pages/event-management/EventAnalytics.tsx`
11. `src/pages/event-management/SurveyAnalytics.tsx`
12. `src/pages/event-management/FeedbackAnalytics.tsx`

## Penutup

Untuk onboarding frontend, urutan yang paling disarankan adalah:

1. jalankan backend
2. jalankan frontend
3. buka route login dan dashboard event
4. telusuri event workspace per tab
5. uji public registration dengan slug event
6. cek bagaimana data frontend terhubung ke analytics page

Dengan urutan itu, struktur aplikasi akan jauh lebih cepat dipahami dari sisi UI, state, dan integrasi backend.
