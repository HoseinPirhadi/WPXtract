document.getElementById("extract-btn").addEventListener("click", function() {
    let siteUrl = document.getElementById("site-url").value.trim();
    if (!siteUrl) {
        showAlert("Please enter a valid WordPress site URL!", "error");
        return;
    }

    let apiUrl = `${siteUrl}/wp-json/wp/v2/users`;
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("result-container").innerHTML = "";

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loading").classList.add("hidden");
            let resultContainer = document.getElementById("result-container");

            if (data.length === 0) {
                showAlert("No users found!", "warning");
                return;
            }

            resultContainer.innerHTML = "<h3>Extracted Users:</h3>";
            let userList = [];

            data.forEach(user => {
                let userInfo = `👤 <b>${user.name}</b> (${user.slug}) - ✉️ ${user.email || "N/A"}`;
                resultContainer.innerHTML += `<p>${userInfo}</p>`;
                userList.push(userInfo);
            });

            document.getElementById("copy-btn").classList.remove("hidden");
            document.getElementById("download-btn").classList.remove("hidden");

            // ذخیره کاربران برای کپی و دانلود
            window.extractedUsers = userList.join("\n");
        })
        .catch(error => {
            document.getElementById("loading").classList.add("hidden");
            showAlert("Error fetching users. Make sure the site is accessible and uses WordPress REST API.", "error");
        });
});

// کپی به کلیپ‌بورد
document.getElementById("copy-btn").addEventListener("click", function() {
    navigator.clipboard.writeText(window.extractedUsers).then(() => {
        showAlert("Copied to clipboard!", "success");
    });
});

// دانلود JSON
document.getElementById("download-btn").addEventListener("click", function() {
    let blob = new Blob([window.extractedUsers], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.json";
    a.click();
});

// تغییر زبان
document.getElementById("lang-toggle").addEventListener("click", function() {
    let label = document.getElementById("url-label");
    let button = document.getElementById("extract-btn");
    
    if (label.innerText.includes("Enter")) {
        label.innerText = "آدرس سایت وردپرسی را وارد کنید:";
        button.innerText = "استخراج کاربران";
    } else {
        label.innerText = "Enter WordPress Site URL:";
        button.innerText = "Extract Users";
    }
});

// تغییر تم (دارک/لایت)
document.getElementById("theme-toggle").addEventListener("click", function() {
    document.body.classList.toggle("light-mode");
    let themeIcon = document.getElementById("theme-toggle");
    themeIcon.textContent = document.body.classList.contains("light-mode") ? "☀️" : "🌙";
});

// نمایش پیام هشدار
function showAlert(message, type) {
    let alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.padding = "10px";
    alertBox.style.backgroundColor = type === "error" ? "red" : type === "success" ? "green" : "orange";
    alertBox.style.color = "white";
    alertBox.style.borderRadius = "5px";
    
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
}
