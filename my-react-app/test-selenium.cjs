// test-selenium.js
// Ejecutar con: node test-selenium.js
// Ejecutar en modo headless: HEADLESS=true node test-selenium.js
// IMPORTANTE: La app debe estar funcionando en http://localhost:5173

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testArtemisApp() {
  console.log('Iniciando tests E2E de Artemis...\n');
  
  // Configurar opciones de Chrome
  const chromeOptions = new chrome.Options();
  
  // Configurar modo headless si la variable de entorno está activada
  const isHeadless = process.env.HEADLESS === 'true';
  
  if (isHeadless) {
    console.log('🤖 Ejecutando en modo HEADLESS\n');
    chromeOptions.addArguments('--headless=new'); // Usar el nuevo modo headless
    chromeOptions.addArguments('--no-sandbox'); // Necesario para CI/CD
    chromeOptions.addArguments('--disable-dev-shm-usage'); // Evita problemas de memoria en CI
    chromeOptions.addArguments('--disable-gpu'); // Desactiva GPU en headless
    chromeOptions.addArguments('--window-size=1920,1080'); // Tamaño de ventana fijo
    chromeOptions.addArguments('--disable-blink-features=AutomationControlled'); // Evita detección
  } else {
    console.log('🖥️  Ejecutando en modo NORMAL (con interfaz gráfica)\n');
    chromeOptions.addArguments('--window-size=1920,1080');
  }

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  try {
    // TEST 1: Cargar la página principal
    console.log('TEST 1: Cargando página principal...');
    await driver.get('http://localhost:5173');
    await driver.sleep(2000);
    const title = await driver.getTitle();
    console.log(`    ✓ Título: "${title}"`);
    console.log('    ✓ Página cargada correctamente\n');

    // TEST 2: Verificar que el sidebar está visible
    console.log('TEST 2: Verificando sidebar...');
    const sidebar = await driver.findElement(By.css('[class*="MuiDrawer"]'));
    const isSidebarVisible = await sidebar.isDisplayed();
    if (isSidebarVisible) {
      console.log('    ✓ Sidebar visible\n');
    } else {
      throw new Error('Sidebar NO visible');
    }

    // TEST 3: Verificar botones del sidebar
    console.log('TEST 3: Verificando botones del sidebar...');
    const helpButton = await driver.findElement(By.xpath("//button[contains(., 'Help')]"));
    console.log('    ✓ Botón "Help" encontrado');
    const reportButton = await driver.findElement(By.xpath("//button[contains(., 'Report bug')]"));
    console.log('    ✓ Botón "Report bug" encontrado\n');

    // TEST 4: Abrir diálogo de ayuda
    console.log('TEST 4: Abriendo diálogo de ayuda...');
    await helpButton.click();
    await driver.sleep(1000);
    // Buscar el título del diálogo
    const dialogTitle = await driver.findElement(By.xpath("//*[contains(text(), 'How to use Artemis?')]"));
    const isDialogVisible = await dialogTitle.isDisplayed();
    if (isDialogVisible) {
      console.log('    ✓ Diálogo de ayuda abierto correctamente');
      // Cerrar el diálogo
      const closeButton = await driver.findElement(By.xpath("//button[contains(., 'CLOSE')]"));
      await closeButton.click();
      await driver.sleep(500);
      console.log('    ✓ Diálogo cerrado correctamente\n');
    }

    // TEST 5: Navegar usando los botones del sidebar
    console.log('TEST 5: Navegando por la aplicación...');
    const sidebarButtons = await driver.findElements(By.css('[class*="MuiButton-root"]'));
    if (sidebarButtons.length > 0) {
      // Intentar click en el segundo botón (evitamos el primero que puede ser el activo)
      if (sidebarButtons.length > 2) {
        await sidebarButtons[2].click();
        await driver.sleep(1000);
        const newUrl = await driver.getCurrentUrl();
        console.log(`    ✓ Navegado a: ${newUrl}\n`);
      }
    }

    // TEST 6: Verificar que podemos volver atrás
    console.log('TEST 6: Probando navegación hacia atrás...');
    await driver.navigate().back();
    await driver.sleep(500);
    const backUrl = await driver.getCurrentUrl();
    console.log(`    ✓ URL después de volver: ${backUrl}\n`);

    // RESUMEN
    console.log('═'.repeat(50));
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('═'.repeat(50));
    
    process.exit(0); // Exit con código 0 para indicar éxito
    
  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1); // Exit con código 1 para indicar fallo
  } finally {
    // Cerrar el navegador
    console.log('\n🔒 Cerrando navegador...');
    await driver.quit();
    console.log('✓ Navegador cerrado\n');
  }
}

// Verificar que la URL es correcta
console.log('IMPORTANTE: Asegúrate de que tu app está funcionando en http://localhost:5173');
console.log('Ejecuta "npm run dev" en otra terminal antes de ejecutar este test.\n');

// Ejecutar los tests
testArtemisApp();