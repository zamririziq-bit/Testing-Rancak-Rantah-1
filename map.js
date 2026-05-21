document.addEventListener("DOMContentLoaded", function() {
    
    // =========================================
    // 1. SISTEM PETA (MAP & FILTER)
    // =========================================
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
        const map = L.map('map', { zoomControl: false }).setView([-0.9471, 100.4172], 9);
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const locations = [
            { name: "Jam Gadang Bukittinggi", lat: -0.3049, lng: 100.3695, category: "culture", crowd: "high" },
            { name: "Kawasan Pariaman", lat: -0.6277, lng: 100.1171, category: "culture", crowd: "medium" },
            { name: "Desa Pariangan", lat: -0.4688, lng: 100.4853, category: "village", crowd: "low" },
            { name: "Lembah Harau", lat: -0.0980, lng: 100.6622, category: "nature", crowd: "medium" },
            { name: "Air Terjun Sarasah", lat: -0.9250, lng: 100.4600, category: "waterfall", crowd: "medium" },
            { name: "Danau Maninjau", lat: -0.3228, lng: 100.2241, category: "lake", crowd: "low" },
            { name: "Pantai Carolina", lat: -1.0250, lng: 100.4000, category: "beach", crowd: "high" },
            { name: "Pantai Air Manis", lat: -0.9856, lng: 100.3606, category: "beach", crowd: "high" },
            { name: "Pesisir Selatan", lat: -1.3533, lng: 100.5750, category: "beach", crowd: "medium" },
            { name: "Taraso Makan Padang", lat: -0.9150, lng: 100.3620, category: "culinary", crowd: "high" },
            { name: "Lontong Uncu Lapai", lat: -0.9000, lng: 100.3550, category: "culinary", crowd: "medium" },
            { name: "Mie Gacoan", lat: -0.9200, lng: 100.3650, category: "culinary", crowd: "high" }
        ];

        const categoryColors = {
            "all": "#5d1111", "nature": "#3c8765", "culture": "#5a8a31",
            "culinary": "#d49a2a", "beach": "#8a3151", "waterfall": "#318a8a",
            "village": "#966b42", "lake": "#754296"
        };

        let mapMarkers = [];

        function renderMarkers(data) {
            mapMarkers.forEach(item => map.removeLayer(item.marker));
            mapMarkers = [];
            
            data.forEach(loc => {
                const color = categoryColors[loc.category] || "#333";
                const customIcon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24], iconAnchor: [12, 12]
                });
                
                const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
                    .bindPopup(`<b>${loc.name}</b><br><span style="text-transform:capitalize; color:#666;">${loc.category} • Crowd: ${loc.crowd}</span>`);
                
                marker.addTo(map);
                mapMarkers.push({ marker: marker, data: loc });
            });
        }

        renderMarkers(locations);

        let activeCategory = "all";
        const categoryItems = document.querySelectorAll('.category-list li');
        
        categoryItems.forEach(item => {
            item.addEventListener('click', function() {
                categoryItems.forEach(i => i.style.fontWeight = 'normal');
                this.style.fontWeight = 'bold';
                activeCategory = this.innerText.trim().toLowerCase();
                if(activeCategory === "all categories") activeCategory = "all";
            });
        });
        
        if(categoryItems.length > 0) categoryItems[0].style.fontWeight = 'bold';

        const applyBtn = document.querySelector('.btn-filter');
        const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
        
        if(applyBtn) {
            applyBtn.addEventListener('click', () => {
                applyBtn.textContent = "Filtering...";
                applyBtn.style.opacity = "0.7";
                
                setTimeout(() => {
                    const selectedCrowds = [];
                    if(checkboxes[0] && checkboxes[0].checked) selectedCrowds.push("low");
                    if(checkboxes[1] && checkboxes[1].checked) selectedCrowds.push("medium");
                    if(checkboxes[2] && checkboxes[2].checked) selectedCrowds.push("high");

                    const filteredData = locations.filter(loc => {
                        const matchCat = (activeCategory === "all") || (loc.category === activeCategory);
                        const matchCrowd = (selectedCrowds.length === 0) || (selectedCrowds.includes(loc.crowd));
                        return matchCat && matchCrowd;
                    });
                    
                    renderMarkers(filteredData);
                    applyBtn.textContent = "Apply Filter";
                    applyBtn.style.opacity = "1";
                }, 400); 
            });
        }
    }

    // =========================================
    // 2. SISTEM KALENDER
    // =========================================
    const monthYearDisplay = document.getElementById("month-year-display");
    const calendarDays = document.getElementById("calendar-days");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    if (calendarDays && monthYearDisplay) {
        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        const events = [
            { date: 15, month: 5, year: 2026, title: "Festival Rendang" },
            { date: 16, month: 5, year: 2026, title: "Festival Rendang" },
            { date: 17, month: 5, year: 2026, title: "Festival Rendang" },
            { date: 22, month: 5, year: 2026, title: "Pacu Jawi" },
            { date: 23, month: 5, year: 2026, title: "Pacu Jawi" },
            { date: 5, month: 6, year: 2026, title: "Festival Tabuik" },
            { date: 6, month: 6, year: 2026, title: "Festival Tabuik" }
        ];

        let currentDate = new Date(2026, 5, 1);

        function renderCalendar() {
            calendarDays.innerHTML = ""; 
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

            for (let i = 0; i < startDayIndex; i++) {
                const emptyDiv = document.createElement("div");
                emptyDiv.className = "calendar-day empty";
                calendarDays.appendChild(emptyDiv);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement("div");
                dayDiv.className = "calendar-day";
                dayDiv.textContent = day;

                if (events.find(e => e.date === day && e.month === month && e.year === year)) {
                    dayDiv.classList.add("event-day");
                }
                calendarDays.appendChild(dayDiv);
            }
        }

        if(prevMonthBtn) prevMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        if(nextMonthBtn) nextMonthBtn.addEventListener("click", () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        
        renderCalendar();
    }
});
