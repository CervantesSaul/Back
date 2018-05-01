var socket = io.connect('http://localhost:8080', {'forceNew':true});

socket.on('connect', function(){
	// call the server-side function 'adduser' and send one parameter (value of prompt)
	socket.emit('adduser', prompt("Cual es tu nombre?"), prompt("Nombre de la sala: "));
});

socket.on('messages', function(data){
	console.log(data);
	render(data);
});

function random(){
	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};
	socket.emit('prueba',payload);
}

function validarChorro(){
	var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	chorro[0] = [1,2,3,31];
	chorro[1] = [1,2,3,10];
	chorro[2] = [1,2,3,30];
	chorro[3] = [1,2,3,11];
	chorro[4] = [1,2,3,9];

	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarChorro',payload,chorro, cartasDestapadas);
}

function validarCentro(){
	//var chorro = new Array();

	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value,
		verificar: false
	};

	//arreglos de combinaciones posibles para chorro
	var chorro = [1,2,3,10];

	//cartas arrojadas por el servidor
	var cartasDestapadas = [1,2,3,4,5,6,7,8,9,10] ;
	socket.emit('verificarCentro',payload,chorro, cartasDestapadas);
}

function render(data){
	document.getElementById('messages').innerHTML  = document.getElementById('messages').innerHTML + '<strong>'+data.autor + ':</strong> <em>' + data.text + '</em><br>'
}

function addMessage(e){
	var payload={
		autor:document.getElementById('username').value,
		text:document.getElementById('texto').value
	};
	socket.emit('new-message', payload);
	return false;
}

socket.on('connectToRoom',function(data) {
    console.log(data);
});

socket.on('numerosBaraja',function(numeroBaraja) {
	console.log(numeroBaraja);
});