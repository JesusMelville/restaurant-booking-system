const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database', 'restaurant.db');
const db = new sqlite3.Database(dbPath);

async function initializeCompleteSystem() {
  console.log('🚀 Inicializando sistema completo con datos de muestra...');
  
  try {
    // Verificar si ya hay datos
    const restaurantCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM restaurants', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (restaurantCount > 0) {
      console.log('✅ El sistema ya tiene datos. No se insertarán datos de muestra.');
      return;
    }

    // 1. Insertar restaurantes
    console.log('\n🍽 Insertando restaurantes...');
    const restaurants = [
      {
        name: "La Mar",
        cuisine_type: "Peruana",
        description: "El mejor restaurante peruano con vista al mar. Especializado en ceviches y pescados frescos con más de 30 años de tradición.",
        address: "Av. La Mar 123, Miraflores",
        phone: "+51 1 234-5678",
        email: "info@lamar.com",
        opening_time: "11:00",
        closing_time: "23:00",
        capacity: 120,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1552566626-8f9919c6b9a?w=800",
        status: "active"
      },
      {
        name: "Sakura Sushi Bar",
        cuisine_type: "Japonesa",
        description: "Auténtica experiencia japonesa con sushi fresco preparado por chefs maestros. Ambiente elegante y servicio impecable.",
        address: "Calle Las Orquídeas 456, San Isidro",
        phone: "+51 1 345-6789",
        email: "contacto@sakura.com",
        opening_time: "12:00",
        closing_time: "23:30",
        capacity: 80,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1579584439413-3d4a7375e9b?w=800",
        status: "active"
      },
      {
        name: "Trattoria Italiana",
        cuisine_type: "Italiana",
        description: "Rica tradición italiana con pasta casera, pizzas de leña de fuego alto y vinos seleccionados de las mejores regiones italianas.",
        address: "Av. Italia 789, Lince",
        phone: "+51 1 456-7890",
        email: "info@trattoria.com",
        opening_time: "12:30",
        closing_time: "00:00",
        capacity: 100,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1555396269-9ad694d64d1?w=800",
        status: "active"
      },
      {
        name: "Le Bistrot Parisien",
        cuisine_type: "Francesa",
        description: "Elegante restaurante francés con coq au vin, escargots y postres clásicos. Vino y ambiente parisino auténtico.",
        address: "Calle Francia 321, San Borja",
        phone: "+51 1 567-8901",
        email: "reservation@lebistrot.com",
        opening_time: "13:00",
        closing_time: "23:00",
        capacity: 60,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1414235077428-142898bad04d?w=800",
        status: "active"
      },
      {
        name: "El Mariachi Loco",
        cuisine_type: "Mexicana",
        description: "Vibrante cocina mexicana con tacos auténticos, guacamole fresco y margaritas. Música en vivo los fines de semana.",
        address: "Av. México 654, Surco",
        phone: "+51 1 678-9012",
        email: "fiesta@mariachiloco.com",
        opening_time: "11:30",
        closing_time: "01:00",
        capacity: 150,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1562367476-c8b2302b777c?w=800",
        status: "active"
      },
      {
        name: "Tapas del Sol",
        cuisine_type: "Española",
        description: "Auténticas tapas españolas con jamón ibérico, paella valenciana y sangría casera. Ambiente mediterráneo.",
        address: "Calle Madrid 987, Barranco",
        phone: "+51 1 789-0123",
        email: "reservas@tapasdelsol.com",
        opening_time: "12:00",
        closing_time: "00:30",
        capacity: 90,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1555396269-9ad694d64d1?w=800",
        status: "active"
      },
      {
        name: "Great Wall Chinese",
        cuisine_type: "Chino",
        description: "Cantonesa tradicional con dim sum, pato pekinés y noodles frescos. Uno de los más antiguos de Lima.",
        address: "Av. China 246, Centro",
        phone: "+51 1 890-1234",
        email: "delivery@greatwall.com",
        opening_time: "11:00",
        closing_time: "22:30",
        capacity: 110,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1565299624946-566f6dd8e27?w=800",
        status: "active"
      },
      {
        name: "Bangkok Dreams",
        cuisine_type: "Tailandesa",
        description: "Sabores exóticos de Tailandia con curry, pad thai y mango sticky rice. Especias auténticas importadas.",
        address: "Cle. Siam 135, Miraflores",
        phone: "+51 1 901-2345",
        email: "info@bangkokdreams.com",
        opening_time: "12:00",
        closing_time: "23:00",
        capacity: 70,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1563244162-1c1c4e0be65?w=800",
        status: "active"
      },
      {
        name: "The Golden Fork",
        cuisine_type: "Internacional",
        description: "Fusión internacional con platos creativos que mezclan lo mejor de varias cocinas. Vino y cócteles de autor.",
        address: "Av. Panorama 789, San Isidro",
        phone: "+51 1 012-3456",
        email: "reservations@goldenfork.com",
        opening_time: "13:00",
        closing_time: "01:00",
        capacity: 85,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1414235077428-142898bad04d?w=800",
        status: "active"
      },
      {
        name: "Vegan Paradise",
        cuisine_type: "Vegetariana",
        description: "Cocina 100% vegana con platos innovadores y saludables. Postres sin azúcar y jugos naturales.",
        address: "Calle Verde 321, Miraflores",
        phone: "+51 1 123-4567",
        email: "hola@veganparadise.com",
        opening_time: "11:00",
        closing_time: "22:00",
        capacity: 65,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1540555700-0e1c74d1b7e?w=800",
        status: "active"
      }
    ];

    for (const restaurant of restaurants) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO restaurants (
            name, cuisine_type, description, address, phone, 
            email, capacity, opening_time, closing_time, 
            rating, image, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          restaurant.name,
          restaurant.cuisine_type,
          restaurant.description,
          restaurant.address,
          restaurant.phone,
          restaurant.email,
          restaurant.capacity,
          restaurant.opening_time,
          restaurant.closing_time,
          restaurant.rating,
          restaurant.image,
          restaurant.status
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log(`✅ ${restaurants.length} restaurantes insertados`);

    // 2. Insertar mesas para cada restaurante
    console.log('\n🪑 Insertando mesas...');
    let tableId = 1;
    const tables = [];

    restaurants.forEach((restaurant, restaurantIndex) => {
      const tablesPerRestaurant = restaurantIndex < 3 ? 12 : 8;
      
      for (let i = 1; i <= tablesPerRestaurant; i++) {
        const capacity = i <= 4 ? 2 : i <= 8 ? 4 : i <= 10 ? 6 : 8;
        const tableType = i <= 4 ? 'estandar' : i <= 8 ? 'grupal' : i <= 10 ? 'VIP' : 'banquete';
        const location = i <= 2 ? 'terraza' : i <= 6 ? 'interior' : i <= 8 ? 'privada' : i <= 10 ? 'barra' : 'jardín';
        
        tables.push({
          restaurant_id: restaurantIndex + 1,
          table_number: `${restaurantIndex + 1}-${i}`,
          capacity,
          table_type: tableType,
          location,
          status: 'available'
        });
        tableId++;
      }
    });

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO tables (
            restaurant_id, table_number, capacity, table_type, 
            location, status
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          table.restaurant_id,
          table.table_number,
          table.capacity,
          table.table_type,
          table.location,
          table.status
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log(`✅ ${tables.length} mesas insertadas`);

    // 3. Insertar usuarios de muestra
    console.log('\n👥 Insertando usuarios...');
    const users = [
      { name: "Carlos Rodríguez", email: "carlos.rodriguez@email.com", phone: "+51 987 654 321", role: "client" },
      { name: "María González", email: "maria.gonzalez@email.com", phone: "+51 987 654 322", role: "client" },
      { name: "Luis Fernández", email: "luis.fernandez@email.com", phone: "+51 987 654 323", role: "client" },
      { name: "Ana Silva", email: "ana.silva@email.com", phone: "+51 987 654 324", role: "client" },
      { name: "Roberto Méndez", email: "roberto.mendez@email.com", phone: "+51 987 654 325", role: "client" },
      { name: "Patricia Vargas", email: "patricia.vargas@email.com", phone: "+51 987 654 326", role: "client" },
      { name: "Diego Castillo", email: "diego.castillo@email.com", phone: "+51 987 654 327", role: "client" },
      { name: "Laura Ríos", email: "laura.rios@email.com", phone: "+51 987 654 328", role: "client" },
      { name: "Miguel Ángulo", email: "miguel.angulo@email.com", phone: "+51 987 654 329", role: "client" },
      { name: "Carmen Torres", email: "carmen.torres@email.com", phone: "+51 987 654 330", role: "client" }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO users (
            name, email, phone, password, role, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          user.name,
          user.email,
          user.phone,
          hashedPassword,
          user.role
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log(`✅ ${users.length} usuarios insertados`);

    // 4. Insertar algunas reservas de ejemplo
    console.log('\n📅 Insertando reservas de ejemplo...');
    const reservations = [
      {
        restaurant_id: 1,
        table_id: 1,
        user_id: 1,
        reservation_date: '2026-03-13',
        reservation_time: '19:00',
        party_size: 2,
        occasion: 'cumpleaños',
        special_requests: 'Mesa cerca de la ventana si es posible',
        status: 'confirmed',
        confirmation_code: 'LA-MAR-20260313-001'
      },
      {
        restaurant_id: 2,
        table_id: 13,
        user_id: 2,
        reservation_date: '2026-03-14',
        reservation_time: '20:00',
        party_size: 4,
        occasion: 'cita_romantica',
        special_requests: 'Opción vegetariana para uno de los comensales',
        status: 'confirmed',
        confirmation_code: 'SAKURA-20260314-002'
      },
      {
        restaurant_id: 3,
        table_id: 23,
        user_id: 3,
        reservation_date: '2026-03-15',
        reservation_time: '13:00',
        party_size: 6,
        occasion: 'reunion_familiar',
        special_requests: 'Sillas adicionales para niños',
        status: 'confirmed',
        confirmation_code: 'TRATT-20260315-003'
      }
    ];

    for (const reservation of reservations) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO reservations (
            restaurant_id, table_id, user_id, reservation_date, 
            reservation_time, party_size, occasion, special_requests,
            status, confirmation_code, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          reservation.restaurant_id,
          reservation.table_id,
          reservation.user_id,
          reservation.reservation_date,
          reservation.reservation_time,
          reservation.party_size,
          reservation.occasion,
          reservation.special_requests,
          reservation.status,
          reservation.confirmation_code
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Insertar en el historial
      await new Promise((resolveHistory) => {
        db.run(`
          INSERT INTO reservation_history (
            reservation_id, status, notes, created_at
          ) VALUES (?, ?, ?, datetime('now'))
        `, [
          reservation.confirmation_code,
          reservation.status,
          reservation.status === 'cancelled' ? 'Cancelada por el cliente' : null
        ], function(err) {
          if (err) console.error('Error insertando historial:', err);
          resolveHistory();
        });
      });
    }

    console.log(`✅ ${reservations.length} reservas insertadas`);

    console.log('\n🎉 Sistema inicializado exitosamente!');
    console.log('\n📊 Resumen de datos insertados:');
    console.log(`   • Restaurantes: ${restaurants.length}`);
    console.log(`   • Mesas: ${tables.length}`);
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Reservas: ${reservations.length}`);
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   • Email: carlos.rodriguez@email.com');
    console.log('   • Contraseña: password123');
    console.log('   • Email: maria.gonzalez@email.com');
    console.log('   • Contraseña: password123');
    console.log('   • ... (y así para todos los usuarios)');
    console.log('\n🚀 El sistema está listo para usar!');
    
  } catch (error) {
    console.error('❌ Error inicializando sistema:', error);
  } finally {
    db.close();
  }
}

initializeCompleteSystem();
