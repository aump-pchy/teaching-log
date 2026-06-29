<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 font-sarabun py-8 px-4 pb-20">
    <div class="max-w-2xl mx-auto space-y-6">

      <!-- Toast Notification -->
      <transition name="toast">
        <div v-if="toast.show" :class="['fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all', toast.type === 'success' ? 'bg-green-600' : 'bg-red-500']">
          <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"></i>
          {{ toast.message }}
        </div>
      </transition>

      <!-- Edit Modal -->
      <div v-if="editModal.show" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-800 to-green-600 text-white">
            <i class="fa-solid fa-pen-to-square"></i>
            <h3 class="font-bold text-sm">แก้ไขข้อมูลแผนกวิชา</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-700">โค้ดแผนก <span class="text-red-400">*</span></label>
              <input type="text" v-model="editModal.data.code" placeholder="เช่น IT, ME, ACC" class="form-input" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-700">ชื่อแผนกวิชา <span class="text-red-400">*</span></label>
              <input type="text" v-model="editModal.data.name" placeholder="เช่น เทคโนโลยีสารสนเทศ" class="form-input" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-700">หัวหน้าแผนกวิชา <span class="text-red-400">*</span></label>
              <input type="text" v-model="editModal.data.headerName" placeholder="ระบุชื่อ-สกุล หัวหน้าแผนก" class="form-input" />
            </div>
          </div>
          <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button @click="editModal.show = false" class="btn btn-cancel">ยกเลิก</button>
            <button @click="saveEdit" :disabled="editModal.loading" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk text-xs"></i>
              {{ editModal.loading ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">
        <div class="flex items-center gap-3 px-7 py-5 bg-gradient-to-r from-green-800 to-green-600 text-white">
          <div class="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
            <i class="fa-solid fa-network-wired text-sm"></i>
          </div>
          <div>
            <h2 class="font-bold text-base leading-tight">จัดการข้อมูลแผนกวิชา</h2>
            <small class="text-white/70 text-xs">ระบุข้อมูลแผนกวิชาและหัวหน้าแผนกภายในสถานศึกษา</small>
          </div>
        </div>

        <div class="p-7 space-y-6">
          <div class="flex gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
            <i class="fa-solid fa-circle-info text-green-500 mt-0.5 shrink-0"></i>
            กรอกข้อมูลรายละเอียดแผนกวิชาให้ครบถ้วนก่อนบันทึกข้อมูลเข้าสู่ระบบ
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <i class="fa-solid fa-building-user text-green-500 text-xs"></i>
                ชื่อแผนกวิชา <span class="text-red-400 text-xs">*</span>
              </label>
              <input
                type="text"
                v-model="departmentData.name"
                placeholder="เช่น เทคโนโลยีสารสนเทศ"
                class="form-input"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <i class="fa-solid fa-user-tie text-green-500 text-xs"></i>
                หัวหน้าแผนกวิชา <span class="text-red-400 text-xs">*</span>
              </label>
              <input
                type="text"
                v-model="departmentData.headerName"
                placeholder="ระบุชื่อ-สกุล หัวหน้าแผนก"
                class="form-input"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <i class="fa-solid fa-hashtag text-green-500 text-xs"></i>
              โค้ดแผนก <span class="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              v-model="departmentData.code"
              placeholder="เช่น IT, ME, ACC"
              class="form-input sm:w-1/2"
            />
          </div>
        </div>

        <div class="flex items-center justify-end px-7 py-5 border-t border-gray-100 bg-gray-50/80">
          <button @click="saveDepartment" :disabled="isLoading" class="btn btn-primary">
            <i class="fa-solid fa-floppy-disk text-xs"></i>
            {{ isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
        </div>
      </div>

      <!-- List Card -->
      <div class="bg-white rounded-2xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
          <h3 class="text-sm font-bold text-green-800 flex items-center gap-2">
            <i class="fa-solid fa-rectangle-list text-green-500"></i>
            รายชื่อแผนกวิชาทั้งหมด
          </h3>

          <div class="flex items-center gap-3">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="ค้นหาแผนกวิชา..."
              class="px-3.5 py-1.5 border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-900 bg-white outline-none focus:border-green-400 w-48 sm:w-56"
            />
            <span class="text-xs text-gray-400 shrink-0">พบ {{ filteredDepartments.length }} รายการ</span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="listLoading" class="text-center py-10 text-sm text-gray-400">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูล...
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in filteredDepartments"
            :key="item.id"
            class="border border-gray-200 rounded-xl p-4 bg-white hover:border-green-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 text-sm">{{ item.name }}</span>
                <span class="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-green-100">
                  department
                </span>
              </div>
              <p class="text-xs text-gray-500">
                <span class="font-medium text-gray-700">หัวหน้าแผนก:</span> {{ item.headerName }}
              </p>
            </div>

            <div class="flex items-center gap-2 self-end sm:self-center">
              <button @click="openEditModal(item)" class="btn-action btn-edit">แก้ไข</button>
              <button @click="deleteItem(item)" class="btn-action btn-delete">ลบ</button>
            </div>
          </div>

          <div v-if="filteredDepartments.length === 0" class="text-center py-8 text-xs text-gray-400">
            ไม่พบข้อมูลแผนกวิชาที่ค้นหา
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── State ──────────────────────────────────────────────────
const departmentData = ref({ code: '', name: '', headerName: '' });
const isLoading   = ref(false);
const listLoading = ref(false);
const searchQuery = ref('');
const departmentsList = ref([]);

const toast = ref({ show: false, message: '', type: 'success' });
const editModal = ref({
  show: false,
  loading: false,
  data: { id: null, code: '', name: '', headerName: '' }
});

// ── Computed ───────────────────────────────────────────────
const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departmentsList.value;
  const q = searchQuery.value.toLowerCase();
  return departmentsList.value.filter(
    item =>
      item.name.toLowerCase().includes(q) ||
      (item.headerName && item.headerName.toLowerCase().includes(q)) ||
      item.code.toLowerCase().includes(q)
  );
});

// ── Helpers ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ── API ────────────────────────────────────────────────────
async function fetchDepartments() {
  listLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/departments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    departmentsList.value = await res.json();
  } catch (err) {
    showToast('โหลดข้อมูลแผนกไม่สำเร็จ', 'error');
    console.error('fetchDepartments:', err);
  } finally {
    listLoading.value = false;
  }
}

async function saveDepartment() {
  const { code, name, headerName } = departmentData.value;
  if (!code.trim() || !name.trim() || !headerName.trim()) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วนก่อนบันทึก', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const res = await fetch(`${BASE_URL}/api/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code: code.trim(), name: name.trim(), headerName: headerName.trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');

    departmentsList.value.unshift(data);
    departmentData.value = { code: '', name: '', headerName: '' };
    showToast('เพิ่มแผนกวิชาสำเร็จ');
  } catch (err) {
    showToast(err.message || 'บันทึกข้อมูลไม่สำเร็จ', 'error');
    console.error('saveDepartment:', err);
  } finally {
    isLoading.value = false;
  }
}

function openEditModal(item) {
  editModal.value = {
    show: true,
    loading: false,
    data: { id: item.id, code: item.code, name: item.name, headerName: item.headerName || '' }
  };
}

async function saveEdit() {
  const { id, code, name, headerName } = editModal.value.data;
  if (!code.trim() || !name.trim() || !headerName.trim()) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  editModal.value.loading = true;
  try {
    const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code: code.trim(), name: name.trim(), headerName: headerName.trim() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');

    const idx = departmentsList.value.findIndex(d => d.id === id);
    if (idx !== -1) departmentsList.value[idx] = data;

    editModal.value.show = false;
    showToast('แก้ไขข้อมูลแผนกสำเร็จ');
  } catch (err) {
    showToast(err.message || 'แก้ไขข้อมูลไม่สำเร็จ', 'error');
    console.error('saveEdit:', err);
  } finally {
    editModal.value.loading = false;
  }
}

async function deleteItem(item) {
  if (!confirm(`❌ คุณแน่ใจที่จะลบแผนกวิชา "${item.name}" หรือไม่?`)) return;
  try {
    const res = await fetch(`${BASE_URL}/api/departments/${item.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');

    departmentsList.value = departmentsList.value.filter(d => d.id !== item.id);
    showToast('ลบแผนกวิชาสำเร็จ');
  } catch (err) {
    showToast(err.message || 'ลบข้อมูลไม่สำเร็จ', 'error');
    console.error('deleteItem:', err);
  }
}

onMounted(() => fetchDepartments());
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  outline: none;
  transition: all 0.2s;
}
.form-input:focus {
  border-color: #34d399;
  border-width: 1.5px;
  box-shadow: 0 0 0 4px #d1fae5;
}
.form-input::placeholder { color: #9ca3af; }

.btn {
  inline-size: max-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background-image: linear-gradient(to right, #16a34a, #065f46);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(209, 250, 229, 1);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(209, 250, 229, 1);
}
.btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
}
.btn-cancel:hover { background-color: #e5e7eb; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-action {
  border: none;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}
.btn-edit  { background-color: #f0fdf4; color: #16a34a; }
.btn-edit:hover  { background-color: #dcfce7; }
.btn-delete { background-color: #fef2f2; color: #dc2626; }
.btn-delete:hover { background-color: #fee2e2; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px); }
</style>