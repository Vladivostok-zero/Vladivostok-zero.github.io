// 在 script.js 开头加这段
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('登录按钮被点击了！');
});
document.getElementById('registerBtn').addEventListener('click', () => {
    alert('注册按钮被点击了！');
});
// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 Supabase
    const supabaseUrl = 'https://ctvqjojvaeuvkwztsypr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dnFqb2p2YWV1dmt3enRzeXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTkwOTcsImV4cCI6MjA2Nzg3NTA5N30.puI7VQhh2ffCIW--aIyQoh1awuOJKnVXTLt3fcgqtco';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // 弹窗控制
    function openModal(modalId, overlayId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById(overlayId);
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        }
    }

    function closeModal(modalId, overlayId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById(overlayId);
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
    }

    // 注册按钮绑定
    document.getElementById('registerBtn').addEventListener('click', () => {
        openModal('registerModal', 'registerOverlay');
    });

    // 注册逻辑
    document.getElementById('submitRegister').addEventListener('click', async () => {
        const nickname = document.getElementById('regNickname').value.trim();
        const password = document.getElementById('regPassword').value;

        if (!nickname || !password) {
            alert('请填写昵称和密码');
            return;
        }

        // 检查昵称是否已存在
        const { data: existing } = await supabase
            .from('users')
            .select('nickname')
            .eq('nickname', nickname)
            .single();

        if (existing) {
            alert('昵称已被占用，请换一个');
            return;
        }

        // 创建匿名用户
        const { data: { user: anonUser }, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
            alert('注册失败：' + anonError.message);
            return;
        }

        // 加密密码并存储
        const hashedPwd = await bcrypt.hash(password, 10);
        const { error: dbError } = await supabase
            .from('users')
            .insert([{
                id: anonUser.id,
                nickname: nickname,
                password: hashedPwd
            }]);

        if (dbError) {
            alert('注册失败：' + dbError.message);
        } else {
            alert('注册成功！现在可以登录了～');
            closeModal('registerModal', 'registerOverlay');
        }
    });

    // 登录按钮绑定
    document.getElementById('loginBtn').addEventListener('click', () => {
        openModal('loginModal', 'loginOverlay');
    });

    // 登录逻辑
    document.getElementById('submitLogin').addEventListener('click', async () => {
        const nickname = document.getElementById('loginNickname').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!nickname || !password) {
            alert('请填写昵称和密码');
            return;
        }

        // 查询用户信息
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('nickname', nickname)
            .single();

        if (fetchError) {
            alert('昵称不存在');
            return;
        }

        // 验证密码
        const isPwdValid = await bcrypt.compare(password, user.password);
        if (!isPwdValid) {
            alert('密码错误');
            return;
        }

        // 登录成功
        alert(`欢迎回来，${nickname}！`);
        closeModal('loginModal', 'loginOverlay');
        
        // 更新导航栏
        document.getElementById('userActions').innerHTML = `
            <span>你好，${nickname}</span>
            <button id="logoutBtn">注销</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            location.reload();
        });
    });

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
                document.getElementById('userActions').innerHTML = `
                    <span>你好，${user.nickname}</span>
                    <button id="logoutBtn">注销</button>
                `;
                document.getElementById('logoutBtn').addEventListener('click', async () => {
                    await supabase.auth.signOut();
                    location.reload();
                });
            }
        }
    }
    checkLogin();
});
