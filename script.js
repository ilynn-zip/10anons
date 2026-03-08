// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCuEm71y4n5iChwXLSkYfLOQV3znAbZI4w",
    authDomain: "anons-2f10d.firebaseapp.com",
    projectId: "anons-2f10d",
    storageBucket: "anons-2f10d.firebasestorage.app",
    messagingSenderId: "666612097831",
    appId: "1:666612097831:web:e0aa5b8e825bbe231f3f02",
    measurementId: "G-GJN1RJHGJ2"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM элементы
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const themeToggle = document.getElementById('theme-toggle');

// Переключение темы
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    if (document.body.classList.contains('dark')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// Загружаем сохранённую тему
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    // По умолчанию светлая (можно изменить на автоматическое определение)
    setTheme('light');
}

themeToggle.addEventListener('click', toggleTheme);

// Коллекция сообщений
const messagesCollection = db.collection('messages');

// Функция для генерации пастельного цвета на основе текста
function getPastelColor(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    // В светлой теме фон светлый, в тёмной тоже оставляем светлый для контраста
    return `hsl(${hue}, 60%, 85%)`; // можно менять под тему, но оставим универсальным
}

// Подписка на последние 10 сообщений
const messagesQuery = messagesCollection.orderBy('timestamp', 'desc').limit(10);
messagesQuery.onSnapshot((snapshot) => {
    messagesDiv.innerHTML = '';
    
    const docs = snapshot.docs.slice().reverse(); // хронологический порядок
    
    docs.forEach(doc => {
        const data = doc.data();
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = data.text;
        
        contentElement.style.backgroundColor = getPastelColor(data.text);
        
        messageElement.appendChild(contentElement);
        messagesDiv.appendChild(messageElement);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Отправка сообщения
sendButton.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;
    
    try {
        await messagesCollection.add({
            author: 'anon',
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = '';
    } catch (error) {
        console.error('Err:', error);
        alert('Failed to send message');
    }
});

// Отправка по Enter
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});
