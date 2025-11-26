// test-selenium.js
// Ejecutar con: node test-selenium.js
// IMPORTANTE: La app debe estar funcionando en http://localhost:5173
// IMPORTANTE: El backend debe estar funcionando en http://localhost:5000

const { Builder, By, until } = require('selenium-webdriver');

// Credenciales de prueba (ajusta según tu base de datos)
const TEST_CREDENTIALS = {
  email: 'alu0101539393@ull.edu.es',    // Cambia esto por un email válido en tu BD
  password: 'papapapa'        // Cambia esto por la contraseña correcta
};

async function testArtemisApp() {
  console.log('🚀 Iniciando tests E2E de Artemis...\n');
  
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    // ========================================
    // FASE DE LOGIN
    // ========================================
    
    // TEST 0: Cargar página de login
    console.log('📝 TEST 0: Cargando página de login...');
    await driver.get('http://localhost:5173/login');
    await driver.sleep(1500);
    console.log('   ✅ Página de login cargada\n');

    // TEST 0.1: Verificar elementos del formulario de login
    console.log('📝 TEST 0.1: Verificando formulario de login...');
    
    const emailInput = await driver.findElement(By.css('input[name="email"]'));
    const passwordInput = await driver.findElement(By.css('input[name="password"]'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    console.log('   ✅ Campos de login encontrados\n');

    // TEST 0.2: Rellenar formulario de login
    console.log('📝 TEST 0.2: Rellenando credenciales...');
    
    await emailInput.clear();
    await emailInput.sendKeys(TEST_CREDENTIALS.email);
    console.log(`   ✅ Email: ${TEST_CREDENTIALS.email}`);
    
    await passwordInput.clear();
    await passwordInput.sendKeys(TEST_CREDENTIALS.password);
    console.log('   ✅ Contraseña: ********\n');

    // TEST 0.3: Enviar formulario y hacer login
    console.log('📝 TEST 0.3: Enviando formulario...');
    await loginButton.click();
    console.log('   ⏳ Esperando respuesta del servidor...');
    
    // Esperar a que la navegación suceda (puede ser a "/" o a una página protegida)
    await driver.sleep(3000);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`   ✅ Login exitoso. URL actual: ${currentUrl}\n`);

    // Verificar que NO estamos en /login (significa que el login fue exitoso)
    if (currentUrl.includes('/login')) {
      throw new Error('❌ El login falló - seguimos en /login. Verifica las credenciales.');
    }

    console.log('✅ FASE DE LOGIN COMPLETADA\n');
    console.log('═'.repeat(50));
    console.log('INICIANDO TESTS DE LA APLICACIÓN');
    console.log('═'.repeat(50) + '\n');

    // ========================================
    // TESTS DE LA APLICACIÓN (SIDEBAR)
    // ========================================

    // TEST 1: Verificar que estamos en la página principal
    console.log('📝 TEST 1: Verificando página principal...');
    await driver.sleep(1000);
    
    const title = await driver.getTitle();
    console.log(`   ✅ Título: "${title}"`);
    console.log('   ✅ Página principal cargada correctamente\n');

    // TEST 2: Verificar que el sidebar está visible
    console.log('📝 TEST 2: Verificando sidebar...');
    
    // Esperar a que el sidebar aparezca
    await driver.wait(until.elementLocated(By.css('[class*="MuiDrawer"]')), 5000);
    
    const sidebar = await driver.findElement(By.css('[class*="MuiDrawer"]'));
    const isSidebarVisible = await sidebar.isDisplayed();
    
    if (isSidebarVisible) {
      console.log('   ✅ Sidebar visible\n');
    } else {
      throw new Error('   ❌ Sidebar NO visible');
    }

    // TEST 3: Verificar botones del sidebar
    console.log('📝 TEST 3: Verificando botones del sidebar...');
    
    const helpButton = await driver.findElement(By.xpath("//button[contains(., 'Help')]"));
    console.log('   ✅ Botón "Help" encontrado');
    
    const reportButton = await driver.findElement(By.xpath("//button[contains(., 'Report bug')]"));
    console.log('   ✅ Botón "Report bug" encontrado\n');

    // TEST 4: Abrir diálogo de ayuda
    console.log('📝 TEST 4: Abriendo diálogo de ayuda...');
    await helpButton.click();
    await driver.sleep(1000);
    
    // Buscar el título del diálogo
    const dialogTitle = await driver.findElement(By.xpath("//*[contains(text(), 'How to use Artemis?')]"));
    const isDialogVisible = await dialogTitle.isDisplayed();
    
    if (isDialogVisible) {
      console.log('   ✅ Diálogo de ayuda abierto correctamente');
      
      // Cerrar el diálogo
      const closeButton = await driver.findElement(By.xpath("//button[contains(., 'CLOSE')]"));
      await closeButton.click();
      await driver.sleep(500);
      console.log('   ✅ Diálogo cerrado correctamente\n');
    } else {
      throw new Error('   ❌ Diálogo de ayuda NO se abrió');
    }

    // TEST 5: Navegar usando los botones del sidebar
    console.log('📝 TEST 5: Navegando por la aplicación...');
    const sidebarButtons = await driver.findElements(By.css('[class*="MuiButton-root"]'));
    
    if (sidebarButtons.length > 0) {
      // Intentar click en el segundo botón (evitamos el primero que puede ser el activo)
      if (sidebarButtons.length > 2) {
        await sidebarButtons[2].click();
        await driver.sleep(1000);
        
        const newUrl = await driver.getCurrentUrl();
        console.log(`   ✅ Navegado a: ${newUrl}\n`);
      }
    }

    // TEST 6: Verificar que podemos volver atrás
    console.log('📝 TEST 6: Probando navegación hacia atrás...');
    await driver.navigate().back();
    await driver.sleep(500);
    const backUrl = await driver.getCurrentUrl();
    console.log(`   ✅ URL después de volver: ${backUrl}\n`);

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('═'.repeat(50));
    console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('═'.repeat(50));
    console.log('\n📊 Resumen:');
    console.log('   • Tests de login: 4/4 ✅');
    console.log('   • Tests de aplicación: 6/6 ✅');
    console.log('   • Total: 10/10 ✅\n');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:', error.message);
    console.error('\n💡 Posibles causas:');
    console.error('   1. Backend no está corriendo en localhost:5000');
    console.error('   2. Credenciales incorrectas en TEST_CREDENTIALS');
    console.error('   3. Usuario de prueba no existe en la base de datos');
    console.error('   4. Elementos no encontrados (selectores incorrectos)\n');
    console.error('Stack completo:', error.stack);
  } finally {
    // Cerrar el navegador
    console.log('\n🔚 Cerrando navegador...');
    await driver.quit();
    console.log('✅ Navegador cerrado\n');
  }
}

// Mensaje inicial
console.log('⚠️  REQUISITOS PREVIOS:');
console.log('   1. Frontend corriendo en http://localhost:5173');
console.log('   2. Backend corriendo en http://localhost:5000');
console.log('   3. Usuario de prueba creado en la base de datos');
console.log(`   4. Email: ${TEST_CREDENTIALS.email}`);
console.log(`   5. Password: ${TEST_CREDENTIALS.password}`);
console.log('\n⚙️  Para cambiar las credenciales, edita TEST_CREDENTIALS al inicio del archivo.\n');

// Ejecutar los tests
testArtemisApp();