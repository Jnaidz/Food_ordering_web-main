$(function () {
    // Main Menu JS
    $(window).scroll(function () {
        if ($(this).scrollTop() < 50) {
            $("nav").removeClass("site-top-nav");
            $("#back-to-top").fadeOut();
        } else {
            $("nav").addClass("site-top-nav");
            $("#back-to-top").fadeIn();
        }
    });

    // Shopping Cart Toggle JS
    $("#shopping-cart").on("click", function () {
        $("#cart-content").toggle("blind", "", 500);
    });

    // Back-To-Top Button JS
    $("#back-to-top").click(function (event) {
        event.preventDefault();
        $("html, body").animate(
            {
            scrollTop: 0,
            },
            1000
        );
    });

    // Delete Cart Item JS
    $(document).on("click", ".btn-delete", function (event) {
        event.preventDefault();
        $(this).closest("tr").remove();
        updateCartTotal();
    });

    // Update Cart Item Total on Quantity Change
    $(document).on("change", ".cart-qty-input", function() {
        let quantity = $(this).val();
        let price = parseFloat($(this).closest("tr").find("td:nth-child(3)").text().replace("$", ""));
        let itemTotal = price * quantity;
        $(this).closest("tr").find(".item-total").text("$" + itemTotal.toFixed(2));
        updateCartTotal();
    });

    // Update Cart Total Price JS
    function updateCartTotal() {
        let total = 0;
        $("#cart-content .cart-table tr:not(:first-child, :last-child)").each(function () {
            const rowTotal = parseFloat($(this).find(".item-total").text().replace("$", ""));
            if (!isNaN(rowTotal)) {
                total += rowTotal;
            }
        });
        $("#cart-content .cart-total-price").text("$" + total.toFixed(2));
    }
    updateCartTotal(); // Initial call to set the initial total

    // Confirm Order Button Action
    $("#confirm-order-btn").on("click", function(event) {
        event.preventDefault();
        let orderItems = [];
        $("#cart-content .cart-table tr:not(:first-child, :last-child)").each(function() {
            let foodName = $(this).find("td:nth-child(2)").text();
            let price = $(this).find("td:nth-child(3)").text();
            let quantity = $(this).find(".cart-qty-input").val();
            orderItems.push({ name: foodName, price: price, quantity: quantity });
        });

        sessionStorage.setItem("currentOrder", JSON.stringify(orderItems));
        window.location.href = "order.html";
    });

    // Display Confirmed Order on order.html
    if (window.location.pathname.includes("order.html")) {
        let storedOrder = sessionStorage.getItem("currentOrder");
        let orderTableBody = $(".tbl-full tbody");
        let grandTotalElement = $("#grand-total");
        let emptyOrderMessage = $("#empty-order-message");
        let orderTable = $(".tbl-full");
        let grandTotal = 0;

        if (storedOrder) {
            let orderItems = JSON.parse(storedOrder);

            if (orderItems.length > 0) {
                orderItems.forEach(item => {
                    let itemTotal = parseFloat(item.price.replace('$', '')) * parseInt(item.quantity);
                    grandTotal += itemTotal;
                    let newRow = `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>$${itemTotal.toFixed(2)}</td>
                        </tr>
                    `;
                    orderTableBody.append(newRow);
                });
                grandTotalElement.text("$" + grandTotal.toFixed(2));
                orderTable.show();
                emptyOrderMessage.hide();
            } else {
                orderTable.hide();
                emptyOrderMessage.show();
            }
        } else {
            orderTable.hide();
            emptyOrderMessage.show();
        }
    }

    // Initialize the cart as an empty array
    // Load cart from localStorage or initialize as empty array
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartUI();
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // This function will be triggered when an item is added to the cart
    window.addToCart = function(name, price, img, quantity) {
        price = parseFloat(price);
        quantity = parseInt(quantity);
        if (isNaN(price) || isNaN(quantity) || quantity < 1) {
            alert("Invalid price or quantity.");
            return;
        }

        const item = {
            name,
            price,
            img,
            qty: quantity,
            total: quantity * price
        };

        // Check if item is already in the cart
        const existingItem = cart.find(i => i.name === name);
        if (existingItem) {
            existingItem.qty += item.qty;
            existingItem.total = existingItem.qty * existingItem.price;
        } else {
            cart.push(item);
        }

        updateCartUI();
        localStorage.setItem("cart", JSON.stringify(cart)); // Update the cart in the localStorage
    };

    // Update the cart UI to display the contents
    function updateCartUI() {
        const cartItemsContainer = document.getElementById("cart-items");
        const cartCount = document.getElementById("cart-count");
        const cartTotal = document.getElementById("cart-total");

        // Clear the current cart items
        cartItemsContainer.innerHTML = "";

        // Calculate total cart price
        let total = 0;

        // Loop through all cart items and create a table row for each
        cart.forEach(item => {
            total += item.total;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${item.img}" alt="${item.name}" style="width: 50px;"></td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>$${item.total.toFixed(2)}</td>
                <td><span class="btn-delete" onclick="removeFromCart('${item.name}')">&times;</span></td>
            `;
            cartItemsContainer.appendChild(row);
        });

        // Update cart count and total price
        cartCount.textContent = cart.length;
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Remove an item from the cart
    window.removeFromCart = function(name) {
        cart = cart.filter(item => item.name !== name);
        updateCartUI();
    };

    // Toggle the visibility of the cart content when clicking the cart icon
    document.getElementById("shopping-cart")?.addEventListener("click", () => {
        const cartContent = document.getElementById("cart-content");
        cartContent.classList.toggle("visible");
    });

    // Bind Add to Cart button click event (assuming buttons have class 'add-to-cart-btn')
    $(document).on("click", ".add-to-cart-btn", function() {
        const name = $(this).data("name");
        const price = $(this).data("price");
        const img = $(this).data("img");
        const quantity = $(this).closest(".food-menu-box").find(".food-qty-input").val() || 1;
        window.addToCart(name, price, img, quantity);
    });
});

$(document).ready(function () {
    // Check if there's a cart stored in sessionStorage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // If the cart is empty, show a message and hide the order table
    if (cart.length === 0) {
        $(".tbl-full").hide();
        $("#empty-order-message").show();
    } else {
        // Populate the order table with items from the cart
        let orderTableBody = $(".tbl-full tbody");
        let total = 0;

        cart.forEach((item, index) => {
            let itemTotal = item.price * item.qty;
            total += itemTotal;
            let row = `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="${item.img}" alt="${item.name}" style="width: 50px;"></td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.qty}</td>
                    <td>$${itemTotal.toFixed(2)}</td>
                    <td><a href="#" class="btn-delete" onclick="removeFromCart('${item.name}')">&times;</a></td>
                </tr>
            `;
            orderTableBody.append(row);
        });

        // Update the total price
        $("#grand-total").text("$" + total.toFixed(2));
    }

    // Handle confirm order button click
    $("#confirm-order-btn").click(function (event) {
        event.preventDefault();

        // Collect customer data from the form
        let fullName = $("input[placeholder='Enter your name...']").val();
        let phone = $("input[placeholder='Enter your phone...']").val();
        let email = $("input[placeholder='Enter your email...']").val();
        let address = $("input[placeholder='Enter your address...']").val();

        // Get the cart items again (since sessionStorage is available on this page)
        let cartItems = JSON.parse(sessionStorage.getItem("cart"));

        // Prepare receipt data
        let receipt = {
            customer: { fullName, phone, email, address },
            orderItems: cartItems,
            total: $("#grand-total").text(),
            date: new Date().toLocaleString()
        };

        // Save receipt to sessionStorage
        sessionStorage.setItem("lastReceipt", JSON.stringify(receipt));

        // Optionally clear cart after order
        sessionStorage.removeItem('cart');
        
        // Redirect to receipt page
        window.location.href = "receipt.html";
    });
});

// Function to remove items from cart
function removeFromCart(itemName) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.name !== itemName);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    location.reload(); // Refresh to update the cart display
}
