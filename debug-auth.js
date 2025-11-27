/**
 * DEBUGGING AUTH FLOW
 * 
 * Этот файл помогает детально отследить процесс авторизации
 */

const API_BASE_URL = 'http://localhost:3000/api';

// 1. Проверим подключение к серверу
async function testServerConnection() {
  console.log('\n=== TEST 1: Server Connection ===');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/health`);
    const data = await response.json();
    console.log('✓ Server is reachable');
    console.log('Response:', data);
    return true;
  } catch (error) {
    console.error('✗ Cannot reach server:', error);
    return false;
  }
}

// 2. Проверим что окно Telegram доступно
function testTelegramAvailable() {
  console.log('\n=== TEST 2: Telegram WebApp ===');
  
  if (window.Telegram?.WebApp) {
    console.log('✓ Telegram WebApp is available');
    
    const tg = window.Telegram.WebApp;
    console.log('WebApp object:', tg);
    
    // Проверим initDataUnsafe
    console.log('initDataUnsafe:', tg.initDataUnsafe);
    
    if (tg.initDataUnsafe?.user) {
      console.log('✓ User data is available');
      console.log('User:', tg.initDataUnsafe.user);
      console.log('Auth date:', tg.initDataUnsafe.auth_date);
      console.log('Hash:', tg.initDataUnsafe.hash);
      return tg.initDataUnsafe;
    } else {
      console.warn('✗ No user data in initDataUnsafe');
      return null;
    }
  } else {
    console.error('✗ Telegram WebApp is NOT available');
    console.warn('Note: This is normal if you are not in Telegram Mini App');
    return null;
  }
}

// 3. Тестируем отправку данных на сервер
async function testAuthRequest(telegramData) {
  console.log('\n=== TEST 3: Auth Request ===');
  
  if (!telegramData?.user) {
    console.error('✗ No telegram user data provided');
    return;
  }
  
  const payload = {
    id: telegramData.user.id,
    first_name: telegramData.user.first_name,
    username: telegramData.user.username,
    auth_date: telegramData.auth_date,
    hash: telegramData.hash,
  };
  
  console.log('Sending payload:', payload);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✓ Authentication successful');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      return data;
    } else {
      console.error('✗ Authentication failed');
      return null;
    }
  } catch (error) {
    console.error('✗ Request failed:', error);
    return null;
  }
}

// Главная функция для запуска всех тестов
async function runDebugTests() {
  console.log('🔧 AUTH FLOW DEBUGGING\n');
  console.log('Current time:', new Date().toISOString());
  console.log('API URL:', API_BASE_URL);
  console.log('Window location:', window.location.href);
  
  // Тест 1: Проверка подключения
  const serverOk = await testServerConnection();
  
  if (!serverOk) {
    console.error('\n✗ Server is not running. Start backend first!');
    return;
  }
  
  // Тест 2: Проверка Telegram
  const telegramData = testTelegramAvailable();
  
  if (!telegramData) {
    console.warn('\n⚠ Open this app only from Telegram Mini App');
    console.log('For testing, you can use mock data:');
    const mockData = {
      user: {
        id: 123456789,
        first_name: 'Test',
        username: 'testuser',
      },
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash_for_testing',
    };
    console.log('Mock data:', mockData);
    return;
  }
  
  // Тест 3: Отправка запроса
  await testAuthRequest(telegramData);
  
  console.log('\n=== DEBUGGING COMPLETE ===\n');
}

// Экспортируем для использования в консоли браузера
window.debugAuth = {
  runAll: runDebugTests,
  testServer: testServerConnection,
  testTelegram: testTelegramAvailable,
  testAuth: testAuthRequest,
};

console.log('✓ Debug utilities loaded');
console.log('Run: debugAuth.runAll() to start debugging');
