export const successRegister = (firstName: string, lastName: string) => `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registro Completado</title>
    <style>
      /* Estilos generales para el correo */
      body {
        font-family: Arial, sans-serif;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
      }
      .header {
        text-align: center;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        color: #fff;
        background-color: #28a745;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #777;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Encabezado con logo -->
      <div class="header">
        <img
          src="https://registrodeimei.cl/wp-content/uploads/2024/11/logo_ri_2.png"
          alt="registrodeimei.cl"
          width="100"
        />
      </div>

      <!-- Mensaje de éxito de registro -->
      <h2>🎉 ¡Registro Completado! 🎉</h2>
      <p>Hola ${firstName} ${lastName},</p>
      <p>
        🎈 ¡Felicitaciones! Tu registro de IMEI ha sido completado y homologado
        con éxito. Ahora tu dispositivo está oficialmente registrado y
        homologado. ✅
      </p>

      <!-- Opción para ver más servicios -->
      <p><strong>¿Necesitas más servicios? 👇</strong></p>
      <div style="text-align: center">
        <a href="https://registrodeimei.cl/blog/" class="button"
          >🔍 Ver más servicios</a
        >
      </div>

      <!-- Mensaje de agradecimiento -->
      <p>Gracias por ser parte de registrodeimei.cl 🙌</p>

      <!-- Pie de página con derechos reservados -->
      <div class="footer">
        <p>&copy; 2024 registrodeimei.cl - Todos los derechos reservados</p>
      </div>
    </div>
  </body>
</html>
`;
