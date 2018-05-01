'use strict'

var mysql = require('mysql');
var express = require('express');
//var app = express();
var app = require('../app');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var rooms = [];

var room = [{
	nombreSala: "",
	numerosBaraja: []
}];

//PARA EJEMPLO UN ARRAY DE MENSAJES AQUI VA LA DB
/*var messages=[{
		id:1,
		text: "Bienvenido a la sala",
		autor:"Loteria"
}];*/

app.use(express.static('public'));


io.on('connection',function(socket){
	console.log('todo va bien');

	socket.on('new-message',function(data){
		//AVISAR A TODOS LOS SOCKETS QUE HAY UN NUEVO MENSAJE
		//io.sockets.emit('messages',messages);
		io.sockets.in(socket.room).emit('messages', data);
	});
	
	//CONFIGURACION DE LAS SALAS
   	//Cuando el cliente emita 'adduser', escucha y ejecuta
	socket.on('adduser', function(username, nombreSala){
		var salaExiste = false;
		//Guarda username en la sesion del socket para cada cliente
		socket.username = username;
		//guarda el nombre de la sala en la sesion del socket para cada cliente
		//socket.room = nombreSala;
		socket.room = nombreSala;
		var len = 0;
		
		for( var i=0; i<rooms.length;i++ ){
			if(rooms[i].nombreSala == nombreSala){
				salaExiste = true;
				var len = i+1;
				break;
			}else{
				salaExiste =false;
			}
		}
		
		if(salaExiste){
			
		}else{
			var rom = room;
			rom.nombreSala = nombreSala;
			rom.numerosBaraja = new Array();

			rooms.push({nombreSala:nombreSala, numerosBaraja: []});
			len = rooms.length;
		}
		

		// Unir al cliente a la sala
		socket.join(rooms[len-1].nombreSala);
		// Mandar mensaje cuando se conecte al usuario
		socket.emit('messages', {autor:'Loteria',text:'Bienvenido a la sala ' + rooms[len-1].nombreSala});
		//Mandar mensaje a todas las personas de la sala excepto al usuario actual
		socket.broadcast.to(rooms[len-1].nombreSala).emit('messages',{autor:'Loteria',text: username +' se ha unido a la sala'});
	});


	socket.on('verificarLlenas',function(data,vectores,cartasDestapadas){
		var centro = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<cartasDestapadas.length;j++){
				if(vectores[i] == cartasDestapadas[j]){
					centro[i] = true;
					//console.log(vectores[i] + " "+ cartasDestapadas[j]);
					break;
				}else{
					centro[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(centro[j]){
					//console.log(esquinas[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				data.verificar = true;
				data.text = "El "+ data.autor +" hizo centro";
				data.autor = "Loteria";
				io.sockets.in(socket.room).emit('messages',data);
				break;
			}
		}
		if(data.verificar != true){
			data.text = "El "+ data.autor +" la cago";
			data.autor = "Loteria";
			io.sockets.in(socket.room).emit('messages',data);
		}
	});

	socket.on('verificarCentro',function(data,vectores,cartasDestapadas){
		var centro = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<cartasDestapadas.length;j++){
				if(vectores[i] == cartasDestapadas[j]){
					centro[i] = true;
					//console.log(vectores[i] + " "+ cartasDestapadas[j]);
					break;
				}else{
					centro[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(centro[j]){
					//console.log(centro[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				data.verificar = true;
				data.text = "El "+ data.autor +" hizo centro";
				data.autor = "Loteria";
				io.sockets.in(socket.room).emit('messages',data);
				break;
			}
		}
		if(data.verificar != true){
			data.text = "El "+ data.autor +" la cago";
			data.autor = "Loteria";
			io.sockets.in(socket.room).emit('messages',data);
		}
	});

	socket.on('prueba',function(pay){
		var idSala = Sala(socket.room);
		if(rooms[idSala].numerosBaraja.length <= 54){
			var number = randomGenerate(idSala);
			//var lon = socket.room.numerosBaraja.length;
			
				rooms[idSala].numerosBaraja.push(number);
			
			//socket.emit('prueba',{prueba:number});
			pay.text = rooms[idSala].numerosBaraja.length+" " + number;
			io.sockets.in(rooms[idSala].nombreSala).emit('messages',pay);
			//setInterval(intervalFunc(pay), 1500);
		}
	});

	function randomGenerate(idSala){
		var randomizar = true;
		if(rooms[idSala].numerosBaraja.length <= 54){

		
			if(rooms[idSala].numerosBaraja.length>0){
				while(randomizar){
					var number = Math.floor(Math.random() * 54) + 1;
					for(var i=0;i<rooms[idSala].numerosBaraja.length;i++){
						if(rooms[idSala].numerosBaraja[i]==number){
							randomizar = true;
							break;
						}else{
							randomizar=false;
						}
					}
				}
			}else{
				var number = Math.floor(Math.random() * 54) + 1;
			}
			return number;
		}
	}

	function Sala(nombreSala){
		for(var i=0; i<rooms.length;i++){
			if(rooms[i].nombreSala==nombreSala){
				return i;
			}
		}
	}

	function intervalFunc(pay) {
		var number = Math.floor(Math.random() * 54) + 1;
		//socket.room.numerosBaraja.push(number);
		//socket.emit('prueba',{prueba:number});
		io.sockets.in(socket.room).emit('messages',pay);
		console.log('Cant stop me now!');
	}
	  

	socket.on('verificarEsquinas',function(data,vectores,cartasDestapadas){
		var esquinas = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length;i++) {
			for(var j=0;j<cartasDestapadas.length;j++){
				if(vectores[i] == cartasDestapadas[j]){
					esquinas[i] = true;
					//console.log(vectores[i][j] + " "+ cartasDestapadas[k]);
					break;
				}else{
					esquinas[i] = false;
				}
			}
			for (var j=0; j<vectores.length;j++){
				if(esquinas[j]){
					//console.log(esquinas[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				data.verificar = true;
				data.text = "El "+ data.autor +" hizo esquinas";
				data.autor = "Loteria";
				io.sockets.in(socket.room).emit('messages',data);
				break;
			}
		}
		if(data.verificar != true){
			data.text = "El "+ data.autor +" la cago";
			data.autor = "Loteria";
			io.sockets.in(socket.room).emit('messages',data);
		}
	});

	socket.on('verificarChorro',function(data,vectores,cartasDestapadas){
		var chorro = [false,false,false,false];
		var bandera = false;
		for (var i=0; i<vectores.length; i++){
			console.log(vectores[i]);
			for (var j=0; j<vectores[i].length; j++){
				for(var k=0;k<cartasDestapadas.length;k++){
					if(vectores[i][j] == cartasDestapadas[k]){
						chorro[j] = true;
						//console.log(vectores[i][j] + " "+ cartasDestapadas[k]);
						break;
					}else{
						chorro[j] = false;
					}
				}
			}
			for (var j=0; j<vectores[i].length;j++){
				if(chorro[j]){
					console.log(chorro[j] + " "+ j + " " +i);
					bandera = true;
				}else{
					bandera = false;
					break;
				}
				
			}
			if(bandera){
				data.verificar = true;
				data.text = "El "+ data.autor +" hizo chorro";
				data.autor = "Loteria";
				io.sockets.in(socket.room.nombreSala).emit('messages',data);
				break;
			}
		}
		if(data.verificar != true){
			data.text = "El "+ data.autor +" la cago";
			data.autor = "Loteria";
			io.sockets.in(socket.room.nombreSala).emit('messages',data);
		}
	});

});


//CONFIGURACION DE LA BD
/*var connection = mysql.createConnection({
   host: 'sql165.main-hosting.eu',
   user: 'u541737295_azu',
   password: '12345678',
   database: 'u541737295_lote',
   port: 3306
});

connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta.');
   }
});*/

server.listen(8080, function(){
	console.log("Servidor corriendo en el puerto 8080");
});
//connection.end();

