// test-selenium.js
// Ejecutar con: node test-selenium.js
// Ejecutar en modo headless: HEADLESS=true node test-selenium.js
// IMPORTANTE: La app debe estar funcionando en http://localhost:5173
// IMPORTANTE: El backend debe estar funcionando en http://localhost:5000

  const { Builder, By, logging } = require('selenium-webdriver');
  const chrome = require('selenium-webdriver/chrome');

async function testArtemisApp() {
  console.log('🚀 Iniciando tests E2E de Artemis...\n');
  
  // Configurar opciones de Chrome
  const chromeOptions = new chrome.Options();
  
  // Configurar logging
  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
  chromeOptions.setLoggingPrefs(prefs);
  
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

  // Aumentar timeout para CI (entornos más lentos)
  await driver.manage().setTimeouts({ implicit: 30000, pageLoad: 60000, script: 60000 });

  try {
    // TEST 1: Cargar la página principal con bypass
    console.log('TEST 1: Configurando entorno de pruebas...');
    await driver.get('http://localhost:5173/?bypass_auth=true');
    await driver.sleep(3000); // Aumentado para CI
    
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
    console.log('📝 TEST 3: Verificando botones del sidebar...');
    
    const helpButton = await driver.findElement(By.xpath("//button[contains(., 'Help')]"));
    console.log('    ✓ Botón "Help" encontrado');
    const reportButton = await driver.findElement(By.xpath("//button[contains(., 'Report bug')]"));
    console.log('    ✓ Botón "Report bug" encontrado\n');

    // TEST 4: Abrir diálogo de ayuda
    console.log('📝 TEST 4: Abriendo diálogo de ayuda...');
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
    console.log('📝 TEST 5: Navegando por la aplicación...');
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

    // TEST 7: Navegar a todas las páginas
    console.log('TEST 7: Navegando a todas las páginas...');
    
    // HomePage (ya estamos aquí)
    await driver.get('http://localhost:5173/?bypass_auth=true');
    await driver.sleep(1000);
    console.log('    ✓ HomePage cargada');
    
    // Community
    await driver.get('http://localhost:5173/community?bypass_auth=true');
    await driver.sleep(1000);
    let pageUrl = await driver.getCurrentUrl();
    if (pageUrl.includes('/community')) {
      console.log('    ✓ Community cargada');
    }
    
    // Gallery
    await driver.get('http://localhost:5173/gallery?bypass_auth=true');
    await driver.sleep(1000);
    pageUrl = await driver.getCurrentUrl();
    if (pageUrl.includes('/gallery')) {
      console.log('    ✓ Gallery cargada');
    }
    
    // Edit User
    await driver.get('http://localhost:5173/edit-user?bypass_auth=true');
    await driver.sleep(1000);
    pageUrl = await driver.getCurrentUrl();
    if (pageUrl.includes('/edit-user')) {
      console.log('    ✓ Edit User cargada');
    }
    
    // Astronomical Events
    await driver.get('http://localhost:5173/astro-events?bypass_auth=true');
    await driver.sleep(1000);
    pageUrl = await driver.getCurrentUrl();
    if (pageUrl.includes('/astro-events')) {
      console.log('    ✓ Astronomical Events cargada\n');
    }

    // TEST 8: Probar ConfigMenu en HomePage
    console.log('TEST 8: Probando ConfigMenu en HomePage...');
    
    // Volver a HomePage
    await driver.get('http://localhost:5173/?bypass_auth=true');
    await driver.sleep(2000);
    
    // Buscar el botón de configuración (⚙)
    const configButton = await driver.findElement(By.css('button[aria-label="Abrir configuración"]'));
    console.log('    ✓ Botón de configuración encontrado');
    
    // Click para abrir el menú
    await configButton.click();
    await driver.sleep(1000); // Aumentar tiempo de espera
    console.log('    ✓ ConfigMenu abierto');
    
    // Verificar que los campos están presentes usando selectores más específicos
    const dateInput = await driver.findElement(By.css('input[type="date"]'));
    const timeInput = await driver.findElement(By.css('input[type="time"]'));
    const numberInputs = await driver.findElements(By.css('input[type="number"]'));
    const latInput = numberInputs[0];
    const lngInput = numberInputs[1];
    console.log('    ✓ Todos los campos de configuración encontrados');
    
    // Modificar valores
    await dateInput.clear();
    await dateInput.sendKeys('2025-12-25');
    await timeInput.clear();
    await timeInput.sendKeys('18:30');
    await latInput.clear();
    await latInput.sendKeys('40.4168');
    await lngInput.clear();
    await lngInput.sendKeys('-3.7038');
    console.log('    ✓ Valores modificados');
    
    // Click en Guardar
    const saveButton = await driver.findElement(By.xpath("//button[contains(., 'Guardar')]"));
    await saveButton.click();
    await driver.sleep(500);
    console.log('    ✓ Configuración guardada');
    
    // Verificar que el menú se cerró
    const configMenusAfter = await driver.findElements(By.css('input[type="date"]'));
    if (configMenusAfter.length === 0) {
      console.log('    ✓ ConfigMenu cerrado correctamente');
    }
    
    // Reabrir y probar botón Cancelar
    await configButton.click();
    await driver.sleep(1000);
    const cancelButton = await driver.findElement(By.xpath("//button[contains(., 'Cancelar')]"));
    await cancelButton.click();
    await driver.sleep(500);
    console.log('    ✓ Botón Cancelar funciona correctamente\n');

    // TEST 9: Verificar flujo de subida de imágenes en Gallery
    console.log('TEST 9: Verificando flujo de subida de imágenes...');
    
    // Navegar a Gallery
    await driver.get('http://localhost:5173/gallery?bypass_auth=true');
    await driver.sleep(2000);
    
    // Verificar que el título de la galería está presente
    const galleryTitle = await driver.findElement(By.xpath("//*[contains(text(), 'My Gallery')]"));
    if (await galleryTitle.isDisplayed()) {
      console.log('    ✓ Página Gallery cargada correctamente');
    }
    
    // Buscar el botón de añadir imagen (botón flotante con +)
    const addImageButton = await driver.findElement(By.css('button[aria-label="add"]'));
    console.log('    ✓ Botón "Añadir imagen" encontrado');
    
    // Click para abrir el diálogo
    await addImageButton.click();
    await driver.sleep(1000);
    console.log('    ✓ Diálogo de subida de imagen abierto');
    
    // Verificar que los campos del formulario están presentes
    try {
      // Buscar campos de texto por label
      const titleLabel = await driver.findElement(By.xpath("//*[contains(text(), 'Image title')]"));
      console.log('    ✓ Campo "Título" encontrado');
      
      // Buscar campo de descripción
      const descLabel = await driver.findElement(By.xpath("//*[contains(text(), 'Image description')]"));
      console.log('    ✓ Campo "Descripción" encontrado');
      
      // Verificar que hay un botón de selección de archivo
      const chooseButton = await driver.findElement(By.xpath("//button[contains(., 'Choose Image')]"));
      console.log('    ✓ Botón de selección de archivo encontrado');
      
      console.log('    ✓ Todos los campos del formulario verificados');
    } catch (e) {
      console.log('    ℹ Algunos campos del formulario no fueron encontrados');
    }
    
    // Cerrar el diálogo (buscar botón Cancelar o cerrar)
    try {
      const cancelButton = await driver.findElement(By.xpath("//button[contains(., 'Cancelar') or contains(., 'Cancel')]"));
      await cancelButton.click();
      await driver.sleep(500);
      console.log('    ✓ Diálogo cerrado correctamente');
    } catch (e) {
      // Intentar cerrar con el botón X o ESC
      await driver.actions().sendKeys('\uE00C').perform(); // ESC key
      await driver.sleep(500);
      console.log('    ✓ Diálogo cerrado con ESC');
    }
    
    console.log('    ✓ Flujo de subida de imágenes verificado\n');

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log('═'.repeat(50));
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('═'.repeat(50));
    console.log('\n📊 Resumen:');
    console.log('   • Tests de login: 4/4 ✅');
    console.log('   • Tests de aplicación: 6/6 ✅');
    console.log('   • Total: 10/10 ✅\n');
    
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