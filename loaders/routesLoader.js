const fs = require('fs');
const path = require('path');

module.exports = function loadRoutes(app) {
  const routesPath = path.join(__dirname, '../routes');

  fs.readdirSync(routesPath).forEach((file) => {
    if (!file.endsWith('.js')) return;

    const routeName = file.replace('.js', '');
    const route = require(path.join(routesPath, file));

    // auto mount path
    const mountPath = `/api/${routeName}`;

    app.use(mountPath, route);

    console.log(`✅ Route loaded: ${mountPath}`);
  });
};
