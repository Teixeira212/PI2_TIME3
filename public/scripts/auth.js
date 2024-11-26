document.addEventListener("DOMContentLoaded", async () => {

    // Obtém o token do localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch("/auth/tokenAuth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            alert('Erro:', result.error)
            window.location.href = "/login";
        } 
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});
