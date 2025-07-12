// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 Supabase
    const supabaseUrl = 'https://ctvqjojvaeuvkwztsypr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dnFqb2p2YWV1dmt3enRzeXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTkwOTcsImV4cCI6MjA2Nzg3NTA5N30.puI7VQhh2ffCIW--aIyQoh1awuOJKnVXTLt3fcgqtco';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // 检查登录状态
    async function checkLogin() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // 获取当前用户昵称
            const { data: user } = await supabase
                .from('users')
                .select('nickname')
                .eq('id', session.user.id)
                .single();

            if (user) {
                // 更新导航栏显示登录状态
                document.getElementById('userActions').innerHTML = `
                    <span>你好，${user.nickname}</span>
                    <button id="logoutBtn">注销</button>
                `;
                // 绑定注销事件
                document.getElementById('logoutBtn').addEventListener('click', async () => {
                    await supabase.auth.signOut();
                    window.location.href = 'index.html'; // 注销后刷新首页
                });
            }
        }
    }

    checkLogin();
});
