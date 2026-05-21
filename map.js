// Inisialisasi peta
var map = L.map('map').setView([-0.9492, 100.3543], 8);

// Basemap OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap Contributors'
}).addTo(map);

// Data destinasi wisata
var destinations = [
    {
        name: "Pantai Carolina",
        location: [-1.103, 100.363],
        description: "Pantai indah di Padang dengan pasir putih dan pulau kecil di sekitarnya."
    },
    {
        name: "Air Terjun Sarasah",
        location: [-1.724, 100.676],
        description: "Air terjun alami yang tersembunyi di kawasan hutan Pesisir Selatan."
    },
    {
        name: "Desa Pariangan",
        location: [-0.455, 100.493],
        description: "Salah satu desa terindah di dunia yang berada di Tanah Datar."
    },
    {
        name: "Danau Tarusan",
        location: [-1.235, 100.529],
        description: "Danau alami yang dikelilingi bukit hijau di Pesisir Selatan."
    },
    {
        name: "Bukittinggi",
        location: [-0.305, 100.369],
        description: "Kota wisata terkenal dengan Jam Gadang dan panorama Ngarai Sianok."
    }
];

// Menambahkan marker ke peta
destinations.forEach(function(place) {

    var marker = L.marker(place.location).addTo(map);

    marker.bindPopup(
        "<b>" + place.name + "</b><br>" +
        place.description
    );

});