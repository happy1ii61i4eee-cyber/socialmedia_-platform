document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/members/Id', { // 對應你的路由
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok) {
      // 登入成功，將 userID 存在 localStorage
      localStorage.setItem('userID', result.userID);
      document.getElementById('message').textContent = "✅ 登入成功！使用者ID：" + result.userID;
    } else {
      document.getElementById('message').textContent = "❌ " + result.error;
    }
  } catch (err) {
    document.getElementById('message').textContent = "⚠️ 伺服器連線錯誤";
  }
});
