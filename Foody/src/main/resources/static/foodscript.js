
const API = "/api";

const foodContainer = document.getElementById("food-container");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalElement = document.getElementById("total");
const search = document.getElementById("search");
const checkout = document.getElementById("checkout");

let foods = [];
let cart = [];

async function loadFoods(query = "") {
    try {
        const response = await fetch(
            `${API}/foods?search=${encodeURIComponent(query)}`
        );

        if (!response.ok) throw new Error("Could not load menu");

        foods = await response.json();
        renderFoods();
    } catch (error) {
        foodContainer.textContent =
            "Could not load menu. Check whether Foody backend is running.";
        console.error(error);
    }
}

function renderFoods() {
    foodContainer.replaceChildren();

    foods.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";

        const image = document.createElement("img");
        image.src = food.imageUrl || "";
        image.alt = food.name;

        if (!food.imageUrl) image.style.display = "none";

        const name = document.createElement("h3");
        name.textContent = food.name;

        const description = document.createElement("p");
        description.textContent = food.description || "";

        const price = document.createElement("h4");
        price.textContent = `₹${food.price}`;

        const button = document.createElement("button");
        button.className = "add-cart";
        button.textContent = "Add To Cart";
        button.addEventListener("click", () => addToCart(food));

        card.append(image, name, description, price, button);
        foodContainer.appendChild(card);
    });

    if (foods.length === 0) {
        foodContainer.textContent = "No matching food items found.";
    }
}

function addToCart(food) {
    const existing = cart.find(item => item.foodId === food.id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            foodId: food.id,
            name: food.name,
            price: Number(food.price),
            quantity: 1
        });
    }

    renderCart();
}

function removeItem(foodId) {
    cart = cart.filter(item => item.foodId !== foodId);
    renderCart();
}

function renderCart() {
    cartItems.replaceChildren();

    if (cart.length === 0) {
        cartItems.textContent = "No Items Added";
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-row";

        const name = document.createElement("span");
        name.textContent = `${item.name} × ${item.quantity}`;

        const price = document.createElement("span");
        price.textContent =
            `₹${(item.price * item.quantity).toFixed(2)}`;

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.addEventListener("click", () =>
            removeItem(item.foodId)
        );

        row.append(name, price, remove);
        cartItems.appendChild(row);
    });

    const count = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    cartCount.textContent = count;
    totalElement.textContent = total.toFixed(2);
}

search.addEventListener("input", () => {
    loadFoods(search.value.trim());
});

checkout.addEventListener("click", async () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const customerName = prompt("Enter your name:");
    if (!customerName || !customerName.trim()) return;

    checkout.disabled = true;

    try {
        const response = await fetch(`${API}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customerName: customerName.trim(),
                items: cart.map(item => ({
                    foodId: item.foodId,
                    quantity: item.quantity
                }))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || result.message ||
                "Order could not be placed");
        }

        alert(
            `Order placed successfully!\n` +
            `Order ID: ${result.orderId}\n` +
            `Total: ₹${result.total}`
        );

        cart = [];
        renderCart();
    } catch (error) {
        alert(error.message || "Could not connect to Foody backend");
        console.error(error);
    } finally {
        checkout.disabled = false;
    }
});

loadFoods();
renderCart();


const aiMessage = document.getElementById("ai-message");
const aiSend = document.getElementById("ai-send");
const aiReply = document.getElementById("ai-reply");

aiSend.addEventListener("click", async () => {
    const message = aiMessage.value.trim();

    if (!message) {
        aiReply.textContent = "Please enter a question.";
        return;
    }

    aiSend.disabled = true;
    aiReply.textContent = "Foody AI is thinking...";

    try {
        const response = await fetch(`${API}/ai/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "AI request failed");
        }

        aiReply.textContent = result.reply;
    } catch (error) {
        aiReply.textContent =
            "Sorry, AI is unavailable. Please try again.";
        console.error(error);
    } finally {
        aiSend.disabled = false;
    }
});



if (aiSend && aiMessage && aiReply) {
    async function askFoodyAI() {
        const message = aiMessage.value.trim();

        if (!message) {
            aiReply.textContent = "Please enter a question first.";
            aiMessage.focus();
            return;
        }

        aiSend.disabled = true;
        aiSend.textContent = "Thinking...";
        aiReply.textContent = "Foody AI is preparing your recommendation...";

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error("Server returned HTTP " + response.status);
            }

            const data = await response.json();

            aiReply.textContent =
                data.reply ?? data.response ?? data.content ??
                "The AI responded, but no reply field was found.";
        } catch (error) {
            console.error("Foody AI error:", error);
            aiReply.textContent =
                "Sorry, Foody AI could not respond. Check that Spring Boot and Ollama are running.";
        } finally {
            aiSend.disabled = false;
            aiSend.textContent = "Ask AI";
        }
    }

    aiSend.addEventListener("click", askFoodyAI);

    aiMessage.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            askFoodyAI();
        }
    });
}


