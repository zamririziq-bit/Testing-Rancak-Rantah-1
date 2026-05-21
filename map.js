document.addEventListener("DOMContentLoaded", function() {
    // 1. Inisialisasi Peta
    // Pusatkan peta di area Sumatera Barat (Padang dan sekitarnya)
    const map = L.map('map', {
        zoomControl: false // Kita nonaktifkan default agar bisa dipindah ke kanan bawah
    }).setView([-0.9471, 100.4172], 9);

    // Tambahkan kontrol zoom di kanan bawah (menyesuaikan desain mockup)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 2. Tambahkan Tile Layer (Peta Dasar dari OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Database Lokasi Wisata & Kuliner
    const locations = [
        // Culture & Village
        { name: "Jam Gadang Bukittinggi", lat: -0.3049, lng: 100.3695, category: "culture", crowd: "high" },
        { name: "Kawasan Pariaman", lat: -0.6277, lng: 100.1171, category: "culture", crowd: "medium" },
        { name: "Desa Pariangan", lat: -0.4688, lng: 100.4853, category: "village", crowd: "low" },
        
        // Nature, Waterfall & Lake
        { name: "Lembah Harau", lat: -0.0980, lng: 100.6622, category: "nature", crowd: "medium" },
        { name: "Air Terjun Sarasah", lat: -0.9250, lng: 100.4600, category: "waterfall", crowd: "medium" },
        { name: "Danau Maninjau", lat: -0.3228, lng: 100.2241, category: "lake", crowd: "low" },
        
        // Beach
        { name: "Pantai Carolina", lat: -1.0250, lng: 100.4000, category: "beach", crowd: "high" },
        { name: "Pantai Air Manis", lat: -0.9856, lng: 100.3606, category: "beach", crowd: "high" },
        { name: "Pesisir Selatan (Mandeh)", lat: -1.3533, lng: 100.5750, category: "beach", crowd: "medium" },

        // Culinary
        { name: "Taraso Makan Padang", lat: -0.9150, lng: 100.3620, category: "culinary", crowd: "high" },
        { name: "Lontong Uncu Lapai", lat: -0.9000, lng: 100.3550, category: "culinary", crowd: "medium" },
        { name: "Mie Gacoan", lat: -0.9200, lng: 100.3650, category: "culinary", crowd: "high" }
    ];

    // Pemetaan warna berdasarkan kategori
    const categoryColors = {
        "all": "#5d1111",
        "nature": "#3c8765",
        "culture": "#5a8a31",
        "culinary": "#d49a2a",
        "beach": "#8a3151",
        "waterfall": "#318a8a",
        "village": "#966b42",
        "lake": "#754296"
    };

    // Array untuk menyimpan referensi marker agar mudah difilter
    let mapMarkers = [];

    // 4. Fungsi untuk membuat marker kustom (bentuk pin bulat dengan warna)
    function createMarker(loc) {
        const color = categoryColors[loc.category] || "#333";
        
        const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
            .bindPopup(`<b>${loc.name}</b><br><span style="text-transform:capitalize; color:#666;">${loc.category} • Crowd: ${loc.crowd}</span>`);
        
        return marker;
    }

    // 5. Fungsi untuk merender seluruh marker ke peta
    function renderMarkers(data) {
        // Hapus marker yang ada di peta sebelumnya
        mapMarkers.forEach(item => map.removeLayer(item.marker));
        mapMarkers = [];

        // Tambahkan marker baru sesuai data yang difilter
        data.forEach(loc => {
            const marker = createMarker(loc);
            marker.addTo(map);
            mapMarkers.push({ marker: marker, data: loc });
        });
    }

    // Render awal (Semua lokasi)
    renderMarkers(locations);

    // 6. Logika Interaksi Filter UI
    
    // a. State untuk filter yang aktif
    let activeCategory = "all";
    
    // b. Event Listener untuk list kategori
    const categoryItems = document.querySelectorAll('.category-list li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Hapus efek tebal (bold) dari semua kategori
            categoryItems.forEach(i => i.style.fontWeight = 'normal');
            // Beri efek tebal pada kategori yang diklik
            this.style.fontWeight = 'bold';
            
            // Ambil nama kategori dari teks list (misal: " Nature" -> "nature")
            activeCategory = this.innerText.trim().toLowerCase();
            if(activeCategory === "all categories") activeCategory = "all";
        });
    });
    
    // Set kategori "All" sebagai bold di awal
    if(categoryItems.length > 0) categoryItems[0].style.fontWeight = 'bold';

    // c. Event Listener untuk tombol "Apply Filter"
    const applyBtn = document.querySelector('.btn-filter');
    const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');

    applyBtn.addEventListener('click', () => {
        // Efek loading pada tombol
        applyBtn.textContent = "Filtering...";
        applyBtn.style.opacity = "0.7";

        setTimeout(() => {
            // Ambil status crowd level yang dicentang
            const selectedCrowds = [];
            // Asumsi susunan HTML: checkbox index 0 = Low, 1 = Medium, 2 = High
            if(checkboxes[0] && checkboxes[0].checked) selectedCrowds.push("low");
            if(checkboxes[1] && checkboxes[1].checked) selectedCrowds.push("medium");
            if(checkboxes[2] && checkboxes[2].checked) selectedCrowds.push("high");

            // Filter data
            const filteredData = locations.filter(loc => {
                const matchCategory = (activeCategory === "all") || (loc.category === activeCategory);
                const matchCrowd = (selectedCrowds.length === 0) || (selectedCrowds.includes(loc.crowd));
                return matchCategory && matchCrowd;
            });

            // Render ulang peta dengan data hasil filter
            renderMarkers(filteredData);

            // Kembalikan tombol ke semula
            applyBtn.textContent = "Apply Filter";
            applyBtn.style.opacity = "1";

<script>
    document.addEventListener("DOMContentLoaded", function() {
      const monthYearDisplay = document.getElementById("month-year-display");
      const calendarDays = document.getElementById("calendar-days");
      const prevMonthBtn = document.getElementById("prev-month");
      const nextMonthBtn = document.getElementById("next-month");

      // Nama bulan
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      // Data event budaya
      const events = [
        { date: 15, month: 5, year: 2026, title: "Festival Rendang" },
        { date: 16, month: 5, year: 2026, title: "Festival Rendang" },
        { date: 17, month: 5, year: 2026, title: "Festival Rendang" },
        { date: 22, month: 5, year: 2026, title: "Pacu Jawi" },
        { date: 23, month: 5, year: 2026, title: "Pacu Jawi" },
        { date: 5, month: 6, year: 2026, title: "Festival Tabuik" },
        { date: 6, month: 6, year: 2026, title: "Festival Tabuik" }
      ];

      // Set ke Juni 2026 (Bulan ke-5 di JavaScript)
      let currentDate = new Date(2026, 5, 1);

      function renderCalendar() {
        if (!calendarDays || !monthYearDisplay) return; // Mencegah error jika HTML tidak ditemukan
        
        calendarDays.innerHTML = ""; // Bersihkan kalender lama

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Sesuaikan index agar Senin = hari pertama
        let startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        // Bikin kotak kosong di awal bulan
        for (let i = 0; i < startDayIndex; i++) {
          const emptyDiv = document.createElement("div");
          emptyDiv.classList.add("calendar-day", "empty");
          calendarDays.appendChild(emptyDiv);
        }

        // Bikin kotak tanggal
        for (let day = 1; day <= daysInMonth; day++) {
          const dayDiv = document.createElement("div");
          dayDiv.classList.add("calendar-day");
          dayDiv.textContent = day;

          // Cek apakah tanggal ini ada event
          const hasEvent = events.find(e => e.date === day && e.month === month && e.year === year);
          if (hasEvent) {
            dayDiv.classList.add("event-day");
            dayDiv.title = hasEvent.title;
          }

          calendarDays.appendChild(dayDiv);
        }
      }

      // Tombol Navigasi
      if(prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar();
        });
      }

      if(nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        });
      }

      // Tampilkan kalender!
      renderCalendar();
    });
  </script>
</body>
</html>
        }, 400); // Simulasi delay 400ms agar terasa interaktif
    });
});
