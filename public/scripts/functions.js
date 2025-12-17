/* ============================================================
   SESSION (DISPLAY LOGGED IN USER)
============================================================ */
/* NAV BAR */
const navRight = document.querySelector('.right');

function displayUsername(user){
    const names = user.data.fullname.split(" ");
    if (user.type === "admin"){
        navRight.innerHTML = `
            <a href="/cart">Cart</a>
            <a href="/admin" id="accBtn">Admin</a>
        `;
    } else {
        navRight.innerHTML = `
            <a href="/cart">Cart</a>
            <a href="/account" id="accBtn">${names[0]}</a>
        `;
    }

}

/* PROFILE PAGE */
const emailDisplay = document.getElementById('emailDisplay');
const emailDisplayP = document.getElementById('emailDisplayP');
const fullnameDisplay = document.getElementById('fullName');
const firstnameDisplay = document.getElementById('firstnameDisplay');
const lastnameDisplay = document.getElementById('lastnameDisplay');

function displayProfile(user){
    const names = user.data.fullname.split(" ");

    emailDisplay.value = user.data.email;
    emailDisplayP.textContent = user.data.email;
    fullnameDisplay.textContent = user.data.fullname;
    firstnameDisplay.value = names[0];
    lastnameDisplay.value = names[1];
}

async function getLoggedinUser() {
    const res = await fetch("/profileData");
    const user = await res.json();

    if(user.error){
        console.log("You are not logged in");
        return;
    }

    document.body.classList.add(user.data.id);

    if (navRight){
        displayUsername(user);
    }
    if (emailDisplay){
        displayProfile(user);
    }
}
getLoggedinUser();


/* ADDRESS PAGE */
async function loadUserAddress() {
    try {
        const res = await fetch("/api/address/get", {
            method: "GET",
            credentials: "include" // IMPORTANT for session
        });

        if (!res.ok) return;

        const data = await res.json();

        // No address yet
        if (!data.address) {
            document.getElementById("region").textContent = "No address saved";
            document.getElementById("city").textContent = "";
            document.getElementById("barangay").textContent = "";
            document.getElementById("street").textContent = "";
            return;
        }

        const { region, city, barangay, street } = data.address;

        document.getElementById("region").textContent = region || "";
        document.getElementById("city").textContent = city || "";
        document.getElementById("barangay").textContent = barangay || "";
        document.getElementById("street").textContent = street || "";

    } catch (err) {
        console.error("Failed to load address:", err);
    }
}

if (emailDisplay){
    document.addEventListener("DOMContentLoaded", loadUserAddress);
}

/* ============================================================
   LOGOUT FUNCTION
============================================================ */
const signoutBtn = document.querySelector('.signOut');

async function logout() {
    await fetch('/logout', {
        method: 'POST'
    });
    window.location.href = '/';
}
if (signoutBtn){
    signoutBtn.addEventListener('click', logout);
}

/* ============================================================
   FUNCTIONS FOR PRODUCTS DISPLAY
============================================================ */
const category = document.body.dataset.category;
const productsContainer = document.querySelector('.products');
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sort");

// HELPER FUNCTION FOR MAPPING SORT ORDER
function getSortParams(sortValue) {
    switch (sortValue) {
        case "ascending":
            return { sort: "product_price", order: "ASC" };
        case "descending":
            return { sort: "product_price", order: "DESC" };
        case "AZ":
            return { sort: "product_name", order: "ASC" };
        case "ZA":
            return { sort: "product_name", order: "DESC" };
        default:
            return { sort: "", order: "" };
    }
}

// FETCH FUNCTIONS
async function fetchProducts({ search = "", sort = "", order = "" } = {}) {
    const params = new URLSearchParams();

    if (category && category !== "all") params.append("category", category);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);

    const command = `/products?${params.toString()}`;

    try {
        const res = await fetch(command);
        const products = await res.json();
        if (productsContainer){
            displayProducts(products);
        }
        if (adminSelectContainer){
            displayOnSelect(products);
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchProduct(id) {
    try {
        const res = await fetch(`/products/getProduct/${id}`);
        const product = await res.json();

        console.log(product);
        return product;
    }
    catch (err) {
        console.error(err);
    }
}

// EVENT LISTENERS
if (searchInput && sortSelect){
    searchInput.addEventListener("input", () => {
        const { sort, order } = getSortParams(sortSelect.value);
        fetchProducts({ search: searchInput.value, sort, order });
    });

    sortSelect.addEventListener("change", () => {
        const { sort, order } = getSortParams(sortSelect.value);
        fetchProducts({ search: searchInput.value, sort, order });
    });
}


// DISPLAYS PRODUCTS
function displayProducts(products) {
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'prod';
        div.innerHTML = `
            <img src="/ImagesProd/${category}/${product.product_img}" alt="Product Image">
            <p class="productName">${product.product_name}</p>
            <h3 class="productPrice">${product.product_price.toLocaleString('en-PH', {style: "currency", currency: "PHP"})}</h3>
            <button class="addtoCart" data-product-id=${product.product_id}>Add to Cart</button>
        `;

        productsContainer.appendChild(div);
    });
}
if (productsContainer) { // INITIAL DISPLAY
    fetchProducts();
}

/* ============================================================
   FUNCTIONS FOR ADDING TO CART
============================================================ */
if (productsContainer) {
    productsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("addtoCart")) {
        const productId = e.target.dataset.productId;
        add(productId);
    }
    });
}

async function add(productId) {
   fetch("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
   });
}

/* ============================================================
   FUNCTIONS FOR ADDING PRODUCTS
============================================================ */
const imageInput = document.getElementById("productImage");
const imageArea = document.getElementById("imageArea");

if (imageInput){
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            imageInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            imageArea.innerHTML = `
                <img
                    src="${reader.result}"
                    alt="Preview"
                    style="width:100%; height:100%; object-fit:cover;"
                >
            `;
        };

        reader.readAsDataURL(file);
    });
}


/* ============================================================
   FUNCTIONS FOR DELETING A PRODUCT
============================================================ */
const adminSelectContainer = document.getElementById('adminSelect');
const delProductDisplay = document.getElementById('delProductDisplay');
const delProductForm = document.getElementById('delProductForm');

function displayOnSelect(products) {
    adminSelectContainer.innerHTML = `<option value="" disabled selected>--- Select a product to delete ---</option>`;

    products.forEach(product => {
        adminSelectContainer.innerHTML += `<option value="${product.product_id}">${product.product_name}, ${product.category}, (ID: ${product.product_id})</option>`;
        // const option = document.createElement('option');
        // option.value = product.product_id;
        // option.textContent = `${product.product_name}, ${product.category}, (ID: ${product.product_id})`;

        // adminSelectContainer.appendChild(option);
    });
}

async function displayDelProduct(product) {
    delProductDisplay.innerHTML = `
        <img src="../ImagesProd/${product.category}/${product.product_img}" alt="">
        <h2 class="productName">Name: ${product.product_name}</h2>
        <p class="productCategory">Category: ${product.category}</p>
        <p class="productPrice">Price: ${product.product_price}</p>
        <p class="productId">ID: ${product.product_id}</p>
    `;
}
if (adminSelectContainer){
    fetchProducts();
    adminSelectContainer.addEventListener('change', async (e) => {
        const id = e.target.value;

        const product = await fetchProduct(id);

        displayDelProduct(product);
    });
    delProductForm.addEventListener('submit', async (e) => {

        const id = adminSelectContainer.value;

        try {
            const res = await fetch(`/addDel/del${id}`, {
                method: "DELETE"
            });
        }
        catch (err){
            console.error(err);
        }
    });
}


/* ============================================================
   FUNCTIONS FOR DISPLAYING LOCATIONS
============================================================ */
const addressForm = document.querySelector('.addressForm');
const regionSelect = document.getElementById("region");
const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");
const barangaySelect = document.getElementById("barangay");
const streetInput = document.getElementById('street');

if (addressForm){
    // Fetch helper
    async function fetchData(url) {
        const res = await fetch(url);
        return res.json();
    }

    // Load Regions on page load
    async function loadRegions() {
        regionSelect.innerHTML = `<option value="" disabled selected>Select Region</option>`;
        const regions = await fetchData("/api/location/regions");

        console.log(regions);
        regions.forEach(r => {
            regionSelect.innerHTML += `<option value="${r.code}">${r.regionName}</option>`;
        });
    }

    regionSelect.addEventListener("change", async () => {
        const regionCode = regionSelect.value;

        provinceSelect.disabled = true;
        citySelect.disabled = true;
        barangaySelect.disabled = true;

        provinceSelect.innerHTML = `<option value="">Loading...</option>`;
        citySelect.innerHTML = `<option value="">Select City</option>`;
        barangaySelect.innerHTML = `<option value="">Select Barangay</option>`;

        if (!regionCode) return;

        const provinces = await fetchData(`/api/location/provinces/${regionCode}`);

        console.log(provinces);
        // --------------------------------------
        // 🚨 NCR FIX: If no provinces → skip province dropdown
        // --------------------------------------
        if (provinces.length === 0) {
            provinceSelect.innerHTML = `<option value="">No Provinces (NCR)</option>`;
            provinceSelect.disabled = true; // lock it

            // Directly load cities of the region
            const cities = await fetchData(`/api/location/cities/${regionCode}`);

            citySelect.disabled = false;
            citySelect.innerHTML = `<option value="" disabled selected>Select City/Municipality</option>`;
            cities.forEach(c => {
                citySelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
            });

            return;
        }

        // Normal behavior for other regions
        provinceSelect.disabled = false;
        provinceSelect.innerHTML = `<option value="">Select Province</option>`;
        provinces.forEach(p => {
            provinceSelect.innerHTML += `<option value="${p.code}">${p.name}</option>`;
        });
    });

    provinceSelect.addEventListener("change", async () => {
        const provinceCode = provinceSelect.value;

        citySelect.disabled = true;
        barangaySelect.disabled = true;

        citySelect.innerHTML = `<option value="">Loading...</option>`;
        barangaySelect.innerHTML = `<option value="">Select Barangay</option>`;

        if (!provinceCode) return;

        const cities = await fetchData(`/api/location/cities/${provinceCode}`);

        console.log(cities);
        citySelect.disabled = false;
        citySelect.innerHTML = `<option value="" disabled selected>Select City/Municipality</option>`;
        cities.forEach(c => {
            citySelect.innerHTML += `<option value="${c.code}">${c.name}</option>`;
        });
    });

    citySelect.addEventListener("change", async () => {
        const cityCode = citySelect.value;

        barangaySelect.disabled = true;
        barangaySelect.innerHTML = `<option value="">Loading...</option>`;

        if (!cityCode) return;

        const barangays = await fetchData(`/api/location/barangays/${cityCode}`);

        console.log(barangays);
        barangaySelect.disabled = false;
        barangaySelect.innerHTML = `<option value="" disabled selected>Select Barangay</option>`;
        barangays.forEach(b => {
            barangaySelect.innerHTML += `<option value="${b.code}">${b.name}</option>`;
        });
    });

    // Initial load
    loadRegions();
}


/* ============================================================
   FUNCTIONS FOR SAVING ADDRESS
============================================================ */
if (addressForm){
    addressForm.addEventListener("submit", async (e) => {
        e.preventDefault();


        const region = regionSelect.options[regionSelect.selectedIndex].text;

        let province = provinceSelect.options[provinceSelect.selectedIndex]?.text || null;
        if (provinceSelect.value === "") {
            province = null;
        }

        const city = citySelect.options[citySelect.selectedIndex].text;

        const barangay = barangaySelect.options[barangaySelect.selectedIndex].text;

        const street = streetInput.value;

        const payload = {
            region,
            province,
            city,
            barangay,
            street
        };

        const res = await fetch("/api/address/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        alert(data.message);

        setTimeout(()=> {
            window.location.href = "/address";
        }, 500)
    });
}