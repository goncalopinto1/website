export function getWeekKey(date){
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const diff = (date - firstDay) / 86400000;
    const week = Math.ceil((diff + firstDay.getDay() +1) / 7);
    return `${date.getFullYear()}-W${week}`;
}

export function groupContactsByWeek(cachedContacts){
    const counts = {};

    cachedContacts.forEach(c => {
        const date = new Date(c.timestamp);
        const weekKey = getWeekKey(date);
        counts[weekKey] = (counts[weekKey] || 0) + 1;
    });

    return counts;
}


export function groupContactsByDayOfWeek(cachedContacts){
    const counts = {
        "Sunday": 0,
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0
    };

    cachedContacts.forEach(c => {
        const date = new Date(c.timestamp);

        const dayIndex = date.getDay();

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[dayIndex];

        counts[dayName]++;
    });

    return counts;
}