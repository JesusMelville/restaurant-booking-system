const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailService = {
  // Send reservation confirmation
  sendReservationConfirmation: async (userEmail, reservationDetails) => {
    const { restaurant, date, time, partySize, table, confirmationCode } = reservationDetails;
    
    const mailOptions = {
      from: `"Restaurant Booking" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Confirmación de Reserva',
      html: `
        <h1>¡Tu reserva ha sido confirmada!</h1>
        <p><strong>Restaurante:</strong> ${restaurant}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p><strong>Mesa:</strong> ${table}</p>
        <p><strong>Personas:</strong> ${partySize}</p>
        <p><strong>Código de confirmación:</strong> ${confirmationCode}</p>
        <p>Gracias por usar nuestro servicio de reservas.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado');
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  },

  // Send reservation reminder
  sendReservationReminder: async (userEmail, reservationDetails) => {
    const { restaurant, date, time } = reservationDetails;
    
    const mailOptions = {
      from: `"Restaurant Booking" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Recordatorio de Reserva',
      html: `
        <h1>Recordatorio de tu reserva</h1>
        <p>Tienes una reserva programada para mañana:</p>
        <p><strong>Restaurante:</strong> ${restaurant}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p>¡Te esperamos!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de recordatorio enviado');
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  },

  // Send cancellation notification
  sendCancellationNotification: async (userEmail, reservationDetails) => {
    const { restaurant, date, time } = reservationDetails;
    
    const mailOptions = {
      from: `"Restaurant Booking" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Reserva Cancelada',
      html: `
        <h1>Tu reserva ha sido cancelada</h1>
        <p><strong>Restaurante:</strong> ${restaurant}</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Hora:</strong> ${time}</p>
        <p>Esperamos verte pronto.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de cancelación enviado');
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  },
};

module.exports = emailService;
