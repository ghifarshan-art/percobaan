// Fungsi Utama Memuat Data di Dashboard Admin
function loadDashboardData() {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let permanentIncome = parseInt(localStorage.getItem('permanentIncome')) || 0;
    
    document.getElementById('statIncome').innerText = `Rp ${permanentIncome.toLocaleString('id-ID')}`;
    document.getElementById('statOrders').innerText = `${orders.length} Order`;
    
    const statMenusEl = document.getElementById('statMenus');
    if (statMenusEl) { statMenusEl.innerText = `${menus.length} Items`; }

    // 1. TAMPILKAN TABEL ORDERAN MASUK
    const orderTable = document.getElementById('adminOrderTable');
    if (orderTable) {
        if (orders.length === 0) {
            orderTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada pesanan masuk.</td></tr>`;
        } else {
            orderTable.innerHTML = '';
            orders.forEach((order, index) => {
                let badgeColor = order.status === 'Selesai' ? 'bg-success' : 'bg-warning text-dark';
                let actionButtons = '';
                
                if (order.status === 'Diproses') {
                    actionButtons = `
                        <button class="btn btn-success btn-sm rounded-pill px-2 me-1" onclick="event.stopPropagation(); completeOrder(${index})">Selesaikan</button>
                        <button class="btn btn-outline-danger btn-sm rounded-circle" onclick="event.stopPropagation(); deleteOrder(${index})"><i class="fas fa-trash-alt"></i></button>
                    `;
                } else if (order.status === 'Selesai') {
                    actionButtons = `<button class="btn btn-outline-danger btn-sm rounded-circle" onclick="event.stopPropagation(); deleteOrder(${index})"><i class="fas fa-trash-alt"></i></button>`;
                }

                orderTable.innerHTML += `
                    <tr onclick="viewOrderDetails('${order.id}')" style="cursor: pointer;">
                        <td class="ps-3 fw-bold text-primary">#${order.id}</td>
                        <td class="fw-bold">${order.customer}</td>
                        <td class="small text-truncate" style="max-width: 160px;">${order.items}</td>
                        <td class="fw-bold text-success">Rp ${(order.totalPrice).toLocaleString('id-ID')}</td>
                        <td><span class="badge ${badgeColor}">${order.status}</span></td>
                        <td>${actionButtons}</td>
                    </tr>`;
            });
        }
    }

    // 2. TAMPILKAN TABEL MANAJEMEN MENU ETALASE
    loadMenuTable(menus);
}

// Menampilkan list menu etalase dengan tombol Edit dan Hapus
function loadMenuTable(menus) {
    const menuTable = document.getElementById('adminMenuTable');
    if (!menuTable) return;

    if (menus.length === 0) {
        menuTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Etalase kosong. Silakan tambah menu baru!</td></tr>`;
        return;
    }

    menuTable.innerHTML = '';
    menus.forEach(menu => {
        menuTable.innerHTML += `
            <tr>
                <td class="ps-3"><img src="${menu.img}" style="width: 50px; height: 40px; object-fit: cover; border-radius: 5px;"></td>
                <td class="fw-bold">${menu.name}</td>
                <td><span class="badge bg-secondary">${menu.category}</span></td>
                <td class="fw-bold text-success">Rp ${menu.price.toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn btn-sm btn-warning rounded-pill px-3 me-1" onclick="openEditModal(${menu.id})">
                        <i class="fas fa-edit me-1"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger rounded-pill px-3" onclick="deleteMenu(${menu.id})">
                        <i class="fas fa-trash-alt me-1"></i> Hapus
                    </button>
                </td>
            </tr>`;
    });
}

// Membuka Modal Pop-up Edit dan Mengisi Form dengan Data Lama
function openEditModal(id) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let menu = menus.find(m => m.id === id);
    if (!menu) return;

    document.getElementById('editMenuId').value = menu.id;
    document.getElementById('editMenuName').value = menu.name;
    document.getElementById('editMenuPrice').value = menu.price;
    document.getElementById('editMenuCategory').value = menu.category;
    document.getElementById('editMenuImg').value = menu.img;

    let editModal = new bootstrap.Modal(document.getElementById('editMenuModal'));
    editModal.show();
}

// Menangani submit form edit untuk memperbarui data produk
const editMenuForm = document.getElementById('editMenuForm');
if (editMenuForm) {
    editMenuForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let menus = JSON.parse(localStorage.getItem('menus')) || [];
        let id = parseInt(document.getElementById('editMenuId').value);

        let index = menus.findIndex(m => m.id === id);
        if (index !== -1) {
            menus[index].name = document.getElementById('editMenuName').value;
            menus[index].price = parseInt(document.getElementById('editMenuPrice').value) || 0;
            menus[index].category = document.getElementById('editMenuCategory').value;
            menus[index].img = document.getElementById('editMenuImg').value || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";

            localStorage.setItem('menus', JSON.stringify(menus));
            
            let modalElement = document.getElementById('editMenuModal');
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            loadDashboardData();
            alert('Detail produk berhasil diperbarui!');
        }
    });
}

// Menghapus Item Menu dari Etalase secara permanen
function deleteMenu(id) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let targetMenu = menus.find(m => m.id === id);
    if (!targetMenu) return;

    if (confirm(`Apakah Anda yakin ingin menghapus menu "${targetMenu.name}" dari etalase?`)) {
        menus = menus.filter(m => m.id !== id);
        localStorage.setItem('menus', JSON.stringify(menus));
        loadDashboardData();
    }
}

// Menampilkan Pop-Up Rincian Nota Pesanan
function viewOrderDetails(orderId) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let order = orders.find(o => o.id === orderId);
    if(!order) return;

    let itemsListHTML = '';
    let itemsArray = order.items.split(', ');
    itemsArray.forEach(item => {
        itemsListHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 ps-0 py-1">
                <span><i class="fas fa-check-circle text-success me-2"></i> ${item}</span>
            </li>`;
    });

    let modalElement = document.getElementById('orderDetailModal');
    modalElement.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title fw-bold">Nota Pesanan ${order.id}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-1"><strong>ID Transaksi:</strong> <span class="text-danger fw-bold">#${order.id}</span></p>
                    <p class="mb-3"><strong>Nama Pelanggan:</strong> <span class="fw-bold">${order.customer}</span></p>
                    <h6 class="fw-bold mb-2"><i class="fas fa-clipboard-list text-secondary me-1"></i> Daftar Menu:</h6>
                    <ul class="list-group mb-3">${itemsListHTML}</ul>
                    <div class="d-flex justify-content-between fw-bold fs-5 bg-light p-2 rounded border">
                        <span>Total Tagihan:</span>
                        <span class="text-success">Rp ${order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <div class="modal-footer py-2">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Tutup Nota</button>
                </div>
            </div>
        </div>`;

    let myModal = new bootstrap.Modal(modalElement);
    myModal.show();
}

// Selesaikan Pesanan
function completeOrder(index) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index].status === 'Diproses') {
        orders[index].status = 'Selesai';
        let currentPermanentIncome = parseInt(localStorage.getItem('permanentIncome')) || 0;
        let addedIncome = currentPermanentIncome + (parseInt(orders[index].totalPrice) || 0);
        
        localStorage.setItem('permanentIncome', addedIncome);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadDashboardData();
    }
}

// Hapus Riwayat Tampilan Di Tabel Orderan
function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let statusOrder = orders[index].status;
    let pesanKonfirmasi = statusOrder === 'Diproses' ? 'Batalkan pesanan ini?' : 'Hapus riwayat pesanan?';

    if(confirm(pesanKonfirmasi)) {
        orders.splice(index, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadDashboardData();
    }
}

// Reset Pendapatan
function resetIncome() {
    if(confirm('Reset total pendapatan menjadi Rp 0?')) {
        localStorage.setItem('permanentIncome', 0);
        loadDashboardData();
    }
}

// PERBAIKAN LOGIKA: Input Form TAMBAH PRODUK BARU dalam Modal Pop-Up
const addMenuForm = document.getElementById('addMenuForm');
if (addMenuForm) {
    addMenuForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let menus = JSON.parse(localStorage.getItem('menus')) || [];
        
        let newMenu = {
            id: Date.now(),
            name: document.getElementById('menuName').value,
            price: parseInt(document.getElementById('menuPrice').value) || 0,
            category: document.getElementById('menuCategory').value,
            img: document.getElementById('menuImg').value || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
        };

        menus.push(newMenu);
        localStorage.setItem('menus', JSON.stringify(menus));
        
        // Reset isi input form modal
        this.reset();
        
        // Menutup modal Tambah Produk secara otomatis setelah klik simpan sukses
        let modalElement = document.getElementById('addMenuModal');
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        loadDashboardData();
        alert('Menu baru "' + newMenu.name + '" berhasil ditambahkan!');
    });
}

// Memuat data saat halaman dibuka pertama kali
loadDashboardData();
// Sinkronisasi data otomatis tiap 4 detik
setInterval(loadDashboardData, 4000);