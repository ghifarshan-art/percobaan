// Fungsi otomatis untuk memastikan menu default selalu ada tanpa menimpa menu buatanmu
function initDefaultMenus() {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    
    // Daftar menu wajib yang harus ada di Kedai Mamayu
    let defaultMenus = [
        { id: 1001, name: "Seblak Original", price: 12000, category: "Makanan", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
        { id: 1002, name: "Seblak Spesial", price: 17000, category: "Makanan", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
        { id: 1003, name: "Es Teh Manis", price: 5000, category: "Minuman", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400" },
        { id: 1004, name: "Es Jeruk", price: 7000, category: "Minuman", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" }
    ];

    // Cek satu per satu, kalau menu default belum terdaftar di localstorage, kita masukkan
    defaultMenus.forEach(defaultItem => {
        let exists = menus.some(m => m.name.toLowerCase() === defaultItem.name.toLowerCase());
        if (!exists) {
            menus.push(defaultItem);
        }
    });

    // Simpan kembali gabungan menu default + menu buatanmu (Coffie, dll)
    localStorage.setItem('menus', JSON.stringify(menus));
}

// Jalankan pengecekan menu gabungan
initDefaultMenus();

let cart = [];

// Fungsi Menampilkan Menu ke Kolom Makanan & Minuman
function displayMenus() {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let containerMakanan = document.getElementById('container-makanan');
    let containerMinuman = document.getElementById('container-minuman');

    if (containerMakanan) containerMakanan.innerHTML = '';
    if (containerMinuman) containerMinuman.innerHTML = '';

    menus.forEach(menu => {
        let menuHTML = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card card-menu h-100 bg-white">
                    <img src="${menu.img}" class="card-img-top" alt="${menu.name}" style="height: 150px; object-fit: cover;">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title fw-bold mb-1">${menu.name}</h5>
                            <p class="card-text text-success fw-bold mb-3">Rp ${menu.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button class="btn btn-primary-custom text-white w-100 rounded-pill btn-sm" onclick="addToCart(${menu.id})">
                            <i class="fas fa-plus me-1"></i> Tambah
                        </button>
                    </div>
                </div>
            </div>`;

        if (menu.category === 'Makanan' && containerMakanan) {
            containerMakanan.innerHTML += menuHTML;
        } else if (menu.category === 'Minuman' && containerMinuman) {
            containerMinuman.innerHTML += menuHTML;
        }
    });
}

// Fungsi Tambah Barang ke Keranjang Belanja
function addToCart(id) {
    let menus = JSON.parse(localStorage.getItem('menus')) || [];
    let menu = menus.find(m => m.id === id);
    if (!menu) return;

    let cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...menu, quantity: 1 });
    }
    updateCartUI();
}

// Fungsi Update Tampilan Nota Keranjang Belanja
function updateCartUI() {
    let cartList = document.getElementById('cart-items-list');
    let cartCount = document.getElementById('cart-count');
    let cartTotal = document.getElementById('cart-total');

    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = `<p class="text-muted text-center py-4">Keranjangmu masih kosong.</p>`;
        if (cartCount) cartCount.innerText = '0';
        if (cartTotal) cartTotal.innerText = 'Rp 0';
        return;
    }

    cartList.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        cartList.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h6 class="mb-0 fw-bold small">${item.name}</h6>
                    <small class="text-muted">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</small>
                </div>
                <button class="btn btn-sm text-danger border-0 p-1" onclick="removeFromCart(${index})">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>`;
    });

    if (cartCount) cartCount.innerText = totalItems;
    if (cartTotal) cartTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// Fungsi Hapus Item dari Keranjang
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Fungsi Kirim Pesanan ke Kasir Admin
function checkoutOrder() {
    if (cart.length === 0) {
        alert('Keranjang belanja kamu masih kosong, silakan pilih menu terlebih dahulu!');
        return;
    }

    let currentUser = localStorage.getItem('currentUser') || 'Pelanggan Anonim';
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    let itemsSummary = cart.map(item => `${item.name} (${item.quantity}x)`).join(', ');
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let newOrder = {
        id: 'MMY' + Math.floor(1000 + Math.random() * 9000),
        customer: currentUser,
        items: itemsSummary,
        totalPrice: totalPrice,
        status: 'Diproses'
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`Pesanan berhasil dikirim dengan ID Nota: #${newOrder.id}\nSilakan tunggu hidangan Anda disiapkan!`);
    cart = [];
    updateCartUI();
}

// Jalankan fungsi tampil data saat web pertama kali diakses
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = localStorage.getItem('currentUser') || 'Pelanggan';
    let userEl = document.getElementById('display-user');
    if (userEl) userEl.innerText = currentUser;
    
    displayMenus();
});