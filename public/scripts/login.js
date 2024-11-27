document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("message");
    console.log(JSON.stringify({ email, password }))
    try {
        const response = await fetch("http://localhost:3000/account/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Armazena o token no localStorage
            localStorage.setItem("authToken", result.token);
            messageElement.textContent = "Login realizado com sucesso!";
            messageElement.style.color = "green";
            console.log("Token armazenado:", result.token);
            window.location.href = '/homepage'
        } else {
            messageElement.textContent = result.error || "Erro ao realizar login.";
            messageElement.style.color = "red";
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        messageElement.textContent = "Erro ao conectar-se ao servidor.";
        messageElement.style.color = "red";
    }
});
