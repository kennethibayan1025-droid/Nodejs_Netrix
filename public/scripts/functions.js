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
const firstnameDisplay = document.getElementById('firstnameDisplay');
const lastnameDisplay = document.getElementById('lastnameDisplay');

function displayProfile(user){
    console.log(user);

    const names = user.data.fullname.split(" ");

    emailDisplay.value = user.data.email;
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
            <h3 class="productPrice">₱${product.product_price.toLocaleString('en-PH')}</h3>
            <button class="addtoCart" value=${product.product_id}>Add to Cart</button>
        `;

        productsContainer.appendChild(div);
    });
}
if (productsContainer) { // INITIAL DISPLAY
    fetchProducts();
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
        const option = document.createElement('option');
        option.value = product.product_id;
        option.textContent = `${product.product_name}, ${product.category}, (ID: ${product.product_id})`;

        adminSelectContainer.appendChild(option);
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