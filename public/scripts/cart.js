/* ============================================================
   FUNCTIONS FOR DISPLAYING THE CART
============================================================ */
const cartContainer = document.querySelector('.cartProducts');
const paymentContainer = document.querySelector('.payment');

if (cartContainer){
   displayCart();
}

async function getCart() {
   const res = await fetch("/carts/get");
   const items = await res.json();
   return items;
}

async function displayCart() {
   try {
      cartContainer.innerHTML = "";

      const cartItems = await getCart();
      const cartLength = cartItems.length;
      console.log(cartItems);

      if (cartLength === 0) {
         cartContainer.innerHTML = `
         <div class="empty">
            <h2>Cart is empty</h2>
         </div>
         `;
      }


      let totalAmount = 0;
      const shipping = cartLength * 36;

      cartItems.forEach(item => {
         totalAmount += Number(item.subtotal);

         const div = document.createElement('div');
         div.className = 'prods';
         div.innerHTML = `
            <div class="productDetail">
               <img src="/ImagesProd/${item.category}/${item.product_img}" alt="Product Image">
               <h3 class="prodName">${item.product_name}</h3>
            </div>
            <div class="quantitybox">
               <button class="quantitybtn" onclick="updateCart(${item.cart_item_id}, -1)">−</button>
               <input type="text" value="${item.quantity}" disabled>
               <button class="quantitybtn" onclick="updateCart(${item.cart_item_id}, 1)">+</button>
            </div>
            <h3>${item.product_price.toLocaleString('en-PH', {style: "currency", currency: "PHP"})}</h3>
            <h3>${item.subtotal.toLocaleString('en-PH', {style: "currency", currency: "PHP"})}</h3>
            <button class="deleteOrder" title="Delete Order" onclick="removeItem(${item.cart_item_id})"><i class="material-icons">delete</i></button>
         `;

         cartContainer.appendChild(div);
      });

      const TOTAL = totalAmount + shipping;

      const totalAmountF = totalAmount.toLocaleString('en-PH', {style: "currency", currency: "PHP"});
      const shippingF = shipping.toLocaleString('en-PH', {style: "currency", currency: "PHP"});
      const TOTALF = TOTAL.toLocaleString('en-PH', {style: "currency", currency: "PHP"});

      paymentContainer.innerHTML = `
         <div class="top">
               <h1>Payment Details</h1>
               <div class="row">
                  <h3>Subtotal</h3>
                  <h3>${totalAmountF}</h3>
               </div>
               <div class="row">
                  <h3>Shipping</h3>
                  <h3>${shippingF}</h3>
               </div>
         </div>

         <div class="bottom">
               <div class="row">
                  <h3 class="total">Total</h3>
                  <h3 class="totalAmount">${TOTALF}</h3>
               </div>
               <button class="checkout" onclick="checkout(${TOTAL})">Checkout</button>
               <a class="back" onclick="goBack()">&#8592 <span>Go Back Shopping</span></a>
         </div>
      `;

   } catch (err) {
      console.error(err);
   }
}

async function updateCart(cartItemId, change) {
   await fetch("/carts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, change })
   });

   displayCart();
}


async function removeItem(cartItemId) {
   await fetch("/carts/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId })
   });

   displayCart();
}

async function checkout(totalAmount) {
   const res = await fetch("/carts/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalAmount })
   });

   if (res.ok) {
      displayCart();
      showCoutToast();
   }
}

const toast = document.querySelector(".toastsContainer");
const clickSound = new Audio("/Sounds/Pop.mp3");

let toastTimeout;
function showCoutToast() {
    clearTimeout(toastTimeout);
    
    clickSound.currentTime = 0;
    clickSound.volume = 0.25;
    clickSound.play();

    toast.classList.remove("show");
    toast.innerHTML = "";
    void toast.offsetHeight; // force reflow

    toast.innerHTML = `
        <span>✔</span>
        <h2>Checkout Success!</h2>
        <p class="cartToast">All items are succesfully checked out!</p>
    `;

    toast.classList.add("show");

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}