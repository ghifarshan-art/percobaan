// =========================================================================
// 1. INISIALISASI DATA AWAL (MENGAMBIL DATA DARI LOCALSTORAGE)
// =========================================================================
let menus = JSON.parse(localStorage.getItem('menus')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let income = parseInt(localStorage.getItem('income')) || 0;

// =========================================================================
// 2. FUNGSI RENDER TABEL UTAMA DAFTAR PRODUK ETALASE
// =========================================================================
function renderMenus() {
    let tbody = document.getElementById('adminMenuTable');
    if (!tbody) return;
    tbody.innerHTML = '';

    menus.forEach(menu => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <img src="${menu.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" alt="${menu.name}">
                </td>
                <td class="fw-bold small">${menu.name}</td>
                <td><span class="badge bg-secondary btn-sm">${menu.category}</span></td>
                <td class="text-success fw-bold small">Rp ${menu.price.toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1 text-white py-0.5 px-2 small" onclick="openEditModal(${menu.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger py-0.5 px-2 small" onclick="deleteMenu(${menu.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
    updateStats();
}

// =========================================================================
// 3. FUNGSI RENDER TABEL ANTRIAN PESANAN KASIR (DITAMBAH EVENT KLIK BARIS)
// =========================================================================
function renderOrders() {
    let tbody = document.getElementById('adminOrderTable');
    if (!tbody) return;
    tbody.innerHTML = '';

    orders.forEach(order => {
        let statusBadge = order.status === 'Selesai' ? 'bg-success' : 'bg-warning';
        let actionBtn = order.status === 'Diproses' ? 
            `<button class="btn btn-sm btn-success py-0.5 px-2 fw-bold" onclick="event.stopPropagation(); completeOrder('${order.id}')"><i class="fas fa-check-circle me-1"></i>Selesai</button>` : 
            `<span class="text-muted small"><i class="fas fa-check text-success"></i> Selesai </span>`;

        // PERBAIKAN: Seluruh baris TR bisa diklik untuk melihat nota asli detail.
        // event.stopPropagation() dipasang pada tombol agar ketika mengklik aksi, jendela nota tidak ikut pop-up tak sengaja.
        tbody.innerHTML += `
            <tr onclick="openOrderDetailModal('${order.id}')" style="cursor: pointer;" title="Klik baris ini untuk melihat nota detail" class="align-middle">
                <td class="fw-bold text-primary small">${order.id.startsWith('#') ? order.id : '#' + order.id}</td>
                <td class="small fw-bold">${order.customer}</td>
                <td class="text-truncate small" style="max-width: 200px;">${order.items}</td>
                <td class="text-success fw-bold small">Rp ${order.totalPrice.toLocaleString('id-ID')}</td>
                <td><span class="badge ${statusBadge}">${order.status}</span></td>
                <td>
                    ${actionBtn}
                    <button class="btn btn-sm btn-outline-danger py-0.5 px-1 ms-1" onclick="event.stopPropagation(); deleteOrder('${order.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
    });
    updateStats();
}

// =========================================================================
// 4. FUNGSI UPDATE RINGKASAN DASHBOARD ATAS (STATISTIK)
// =========================================================================
function updateStats() {
    if(document.getElementById('statIncome')) document.getElementById('statIncome').innerText = `Rp ${income.toLocaleString('id-ID')}`;
    if(document.getElementById('statOrders')) document.getElementById('statOrders').innerText = `${orders.filter(o => o.status === 'Diproses').length} Order`;
    if(document.getElementById('statMenus')) document.getElementById('statMenus').innerText = `${menus.length} Items`;
}

// =========================================================================
// 5. LOGIKA OPERASIONAL KASIR (SELESAI, HAPUS, & RESET NOTA)
// =========================================================================
function completeOrder(id) {
    let order = orders.find(o => o.id === id);
    if (order && order.status === 'Diproses') {
        order.status = 'Selesai';
        income += order.totalPrice;
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('income', income);
        renderOrders();
    }
}

function deleteOrder(id) {
    if(confirm('Hapus riwayat nota transaksi ini?')) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
    }
}

function resetIncome() {
    if(confirm('Apakah anda yakin ingin mengosongkan statistik seluruh pendapatan saat ini?')) {
        income = 0;
        localStorage.setItem('income', 0);
        updateStats();
    }
}

// =========================================================================
// 6. LOGIKA FORM SUBMIT TAMBAH PRODUK BARU
// =========================================================================
document.getElementById('addMenuForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    let name = document.getElementById('menuName').value;
    let price = parseInt(document.getElementById('menuPrice').value);
    let category = document.getElementById('menuCategory').value;
    
    let fileInput = document.getElementById('menuImgFile');
    let urlInput = document.getElementById('menuImgUrl').value.trim();

    let finalImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"; 

    if (fileInput.files && fileInput.files[0]) {
        let file = fileInput.files[0];
        let reader = new FileReader();
        
        reader.onload = function(event) {
            finalImg = event.target.result;
            saveNewProduct(name, price, category, finalImg);
        };
        reader.readAsDataURL(file);
    } else {
        if(urlInput) {
            finalImg = (urlInput.includes('http://') || urlInput.includes('https://') || urlInput.startsWith('data:')) ? 
                urlInput : `assets/img/${urlInput}`;
        }
        saveNewProduct(name, price, category, finalImg);
    }
});

function saveNewProduct(name, price, category, imgPath) {
    let newMenu = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        img: imgPath
    };
    menus.push(newMenu);
    localStorage.setItem('menus', JSON.stringify(menus));
    
    document.getElementById('addMenuForm').reset();
    let modalEl = document.getElementById('addMenuModal');
    bootstrap.Modal.getInstance(modalEl).hide();
    
    renderMenus();
    alert("Produk baru berhasil ditambahkan!");
}

// =========================================================================
// 7. LOGIKA FORM EDIT PRODUK (AMBIL DATA LAMA DAN TIMPA HASIL BARU)
// =========================================================================
function openEditModal(id) {
    let menu = menus.find(m => m.id === id);
    if (!menu) {
        alert("Data produk tidak ditemukan!");
        return;
    }

    document.getElementById('editMenuId').value = menu.id;
    document.getElementById('editMenuName').value = menu.name;
    document.getElementById('editMenuPrice').value = menu.price;
    document.getElementById('editMenuCategory').value = menu.category;
    
    document.getElementById('editMenuImgFile').value = '';
    
    let urlInput = document.getElementById('editMenuImgUrl');
    if (urlInput) {
        if (menu.img.startsWith('data:')) {
            urlInput.value = ''; 
        } else {
            urlInput.value = menu.img.replace('assets/img/', ''); 
        }
    }

    let editModalElement = document.getElementById('editMenuModal');
    let editModal = bootstrap.Modal.getInstance(editModalElement) || new bootstrap.Modal(editModalElement);
    editModal.show();
}

document.getElementById('editMenuForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let id = parseInt(document.getElementById('editMenuId').value);
    let name = document.getElementById('editMenuName').value;
    let price = parseInt(document.getElementById('editMenuPrice').value);
    let category = document.getElementById('editMenuCategory').value;
    
    let fileInput = document.getElementById('editMenuImgFile');
    let urlInput = document.getElementById('editMenuImgUrl').value.trim();

    let menuIndex = menus.findIndex(m => m.id === id);
    if(menuIndex === -1) {
        alert("Gagal memperbarui, produk tidak terdaftar!");
        return;
    }

    let currentImg = menus[menuIndex].img;

    if (fileInput.files && fileInput.files[0]) {
        let file = fileInput.files[0];
        let reader = new FileReader();
        
        reader.onload = function(event) {
            currentImg = event.target.result;
            saveEditedProduct(menuIndex, name, price, category, currentImg);
        };
        reader.readAsDataURL(file);
    } else {
        if(urlInput) {
            currentImg = (urlInput.includes('http://') || urlInput.includes('https://') || urlInput.startsWith('data:')) ? 
                urlInput : `assets/img/${urlInput}`;
        }
        saveEditedProduct(menuIndex, name, price, category, currentImg);
    }
});

function saveEditedProduct(index, name, price, category, imgPath) {
    menus[index].name = name;
    menus[index].price = price;
    menus[index].category = category;
    menus[index].img = imgPath;

    localStorage.setItem('menus', JSON.stringify(menus));
    
    let modalEl = document.getElementById('editMenuModal');
    let bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    renderMenus();
    alert("Perubahan produk berhasil disimpan!");
}

// =========================================================================
// 8. LOGIKA HAPUS PRODUK DARI ETALASE TOKO
// =========================================================================
function deleteMenu(id) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini dari etalase toko?')) {
        menus = menus.filter(m => m.id !== id);
        localStorage.setItem('menus', JSON.stringify(menus));
        renderMenus();
    }
}

// =========================================================================
// 9. FUNGSI DINAMIS UNTUK POP-UP DETAIL NOTA STRUK KASIR
// =========================================================================
function openOrderDetailModal(id) {
    // 1. Ambil data order tunggal dari array berdasarkan ID
    let order = orders.find(o => o.id === id);
    if (!order) {
        alert("Data nota pesanan tidak ditemukan!");
        return;
    }

    // 2. Pasang data string dasar ke elemen modal teks HTML
    document.getElementById('notaId').innerText = order.id.startsWith('#') ? order.id : `#${order.id}`;
    document.getElementById('notaCustomer').innerText = order.customer;
    document.getElementById('notaTotalPrice').innerText = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;
    
    let statusText = document.getElementById('notaStatus');
    statusText.innerText = order.status;
    if (order.status === 'Selesai') {
        statusText.className = "badge bg-success-custom text-white bg-success";
    } else {
        statusBadge = "badge bg-warning text-dark";
        statusText.className = "badge bg-warning text-dark";
    }

    // 3. Olah data string pesanan ("Menu (2x), Menu2 (1x)") menjadi baris list terpisah
    let container = document.getElementById('notaItemsContainer');
    container.innerHTML = ''; // Kosongkan riwayat lama

    let itemsArray = order.items.split(', ');
    itemsArray.forEach(item => {
        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-1 bg-white p-2 rounded shadow-sm border" style="border-radius: 6px;">
                <span class="text-dark small fw-bold" style="font-size: 0.8rem;"><i class="fas fa-check-circle text-muted me-1" style="font-size: 0.7rem;"></i> ${item}</span>
                <span class="badge bg-light text-muted border small" style="font-size:0.65rem;">Siap</span>
            </div>`;
    });

    // 4. Perintahkan modal Bootstrap untuk pop-up tampil di layar
    let myModalEl = document.getElementById('orderDetailModal');
    let modalInstance = bootstrap.Modal.getInstance(myModalEl) || new bootstrap.Modal(myModalEl);
    modalInstance.show();
}

// =========================================================================
// 10. EVENT RUNNING (OTOMATIS BERJALAN SAAT HALAMAN KASIR DIBUKA)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    renderMenus();
    renderOrders();
});