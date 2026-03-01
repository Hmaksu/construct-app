const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COUNTRIES = [
    { name: 'Turkey', code: 'TR', cities: ['Istanbul', 'Ankara', 'Izmir'] },
    { name: 'Germany', code: 'DE', cities: ['Berlin', 'Munich', 'Hamburg'] },
    { name: 'United States', code: 'US', cities: ['New York', 'Los Angeles', 'Chicago'] },
    { name: 'United Kingdom', code: 'UK', cities: ['London', 'Manchester', 'Birmingham'] },
    { name: 'France', code: 'FR', cities: ['Paris', 'Marseille', 'Lyon'] },
    { name: 'Japan', code: 'JP', cities: ['Tokyo', 'Osaka', 'Kyoto'] },
    { name: 'Australia', code: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
    { name: 'Canada', code: 'CA', cities: ['Toronto', 'Vancouver', 'Montreal'] },
];

const TEMPLATES = {
    road: [
        { code: 'HAZ-ETK', name: 'Geoteknik ve Topografik Etütler', category: 'Hazırlık ve Mobilizasyon' },
        { code: 'HAZ-MOB', name: 'Şantiye Mobilizasyonu ve Tesis Kurulumu', category: 'Hazırlık ve Mobilizasyon' },
        { code: 'HAZ-APL', name: 'Güzergah Aplikasyonu', category: 'Hazırlık ve Mobilizasyon' },
        { code: 'TOP-SYR', name: 'Bitkisel Toprak Sıyırma', category: 'Toprak İşleri' },
        { code: 'TOP-KZI', name: 'Yarma (Kazı) ve Zemin Islahı', category: 'Toprak İşleri' },
        { code: 'TOP-DLG', name: 'Dolgu ve Sıkıştırma (Kompaksiyon)', category: 'Toprak İşleri' },
        { code: 'SAN-DVR', name: 'Menfez ve İstinat Duvarı İmalatları', category: 'Sanat Yapıları ve Drenaj' },
        { code: 'SAN-DRN', name: 'Drenaj Hendekleri ve Kanalları', category: 'Sanat Yapıları ve Drenaj' },
        { code: 'UST-PMT', name: 'Alt Temel ve Plentmiks Temel (PMT) Serimi', category: 'Üstyapı ve Kaplama' },
        { code: 'UST-AST', name: 'Astar (Prime Coat) Uygulaması', category: 'Üstyapı ve Kaplama' },
        { code: 'UST-BND', name: 'Binder Tabakası (Alt Asfalt) Serimi', category: 'Üstyapı ve Kaplama' },
        { code: 'UST-ASN', name: 'Aşınma Tabakası (Yüzey Asfaltı) Serimi', category: 'Üstyapı ve Kaplama' },
        { code: 'TAM-KRK', name: 'Oto Korkuluk (Bariyer) ve Levha Montajı', category: 'Tamamlama ve Trafik Güvenliği' },
        { code: 'TAM-CZG', name: 'Yol Çizgi ve İşaretlemeleri', category: 'Tamamlama ve Trafik Güvenliği' },
        { code: 'TAM-KBL', name: 'Geçici Kabul ve Açılış', category: 'Tamamlama ve Trafik Güvenliği' }
    ],
    sewage: [
        { code: 'HAZ-ETK', name: 'Güzergah Etüdü ve Altyapı Tespiti', category: 'Hazırlık ve Mobilizasyon' },
        { code: 'HAZ-TED', name: 'Malzeme (Boru, Baca) Tedariki', category: 'Hazırlık ve Mobilizasyon' },
        { code: 'KAZ-KRM', name: 'Asfalt/Beton Kesimi ve Kırımı', category: 'Kazı ve Zemin Hazırlığı' },
        { code: 'KAZ-KNL', name: 'Kanal Kazısı İşleri', category: 'Kazı ve Zemin Hazırlığı' },
        { code: 'KAZ-IKS', name: 'İksa Sistemlerinin Kurulumu', category: 'Kazı ve Zemin Hazırlığı' },
        { code: 'KAZ-YST', name: 'Hendek Tabanı Yastıklama', category: 'Kazı ve Zemin Hazırlığı' },
        { code: 'BOR-TSU', name: 'Temiz Su Boruları Döşenmesi', category: 'Boru Döşeme' },
        { code: 'BOR-ATK', name: 'Atıksu Boruları Döşenmesi', category: 'Boru Döşeme' },
        { code: 'BOR-BCA', name: 'Muayene Bacaları İmalatı', category: 'Boru Döşeme' },
        { code: 'BOR-PRS', name: 'Parsel Bağlantıları', category: 'Boru Döşeme' },
        { code: 'TES-SIZ', name: 'Sızdırmazlık Testleri', category: 'Test' },
        { code: 'TES-BSN', name: 'Hidrostatik Basınç Testleri', category: 'Test' },
        { code: 'TES-DZN', name: 'Dezenfeksiyon', category: 'Test' },
        { code: 'KAP-DLG', name: 'Hendek Geri Dolgusu', category: 'Kapatma' },
        { code: 'KAP-YZY', name: 'Yüzey Kaplama Onarımı', category: 'Kapatma' }
    ],
    gas: [
        { code: 'HAZ-SRD', name: 'Çalışma Şeridi Açılması', category: 'Hazırlık' },
        { code: 'HAZ-NKL', name: 'Boruların Nakli', category: 'Hazırlık' },
        { code: 'KAZ-KNL', name: 'Kanal Kazısı', category: 'Kazı' },
        { code: 'KAZ-BKM', name: 'Boru Büküm', category: 'Kazı' },
        { code: 'KAZ-KYN', name: 'Boru Kaynak', category: 'Kazı' },
        { code: 'KAZ-NDT', name: 'NDT Muayene', category: 'Kazı' },
        { code: 'KAZ-IZL', name: 'İzolasyon Testi', category: 'Kazı' },
        { code: 'MON-IND', name: 'Boruların İndirilmesi', category: 'Montaj' },
        { code: 'MON-RMS', name: 'RMS Montajı', category: 'Montaj' },
        { code: 'MON-VNA', name: 'Hat Vana Montajı', category: 'Montaj' },
        { code: 'TES-KTD', name: 'Katodik Koruma', category: 'Test' },
        { code: 'TES-PIG', name: 'Pigging', category: 'Test' },
        { code: 'TES-BSN', name: 'Basınç Testi', category: 'Test' },
        { code: 'KAP-DLG', name: 'Geri Dolgu', category: 'Teslim' },
        { code: 'KAP-DVR', name: 'Devreye Alma', category: 'Teslim' }
    ],
    electricity: [
        { code: 'HAZ-HSP', name: 'Yük Hesapları', category: 'Hazırlık' },
        { code: 'HAZ-APL', name: 'Aplikasyon', category: 'Hazırlık' },
        { code: 'ALT-KZI', name: 'Temel Kazıları', category: 'Altyapı' },
        { code: 'ALT-KNL', name: 'Kablo Kanalı Kazısı', category: 'Altyapı' },
        { code: 'MON-DRK', name: 'Direk Dikimi', category: 'Montaj' },
        { code: 'MON-ILT', name: 'İletken Çekimi', category: 'Montaj' },
        { code: 'MON-KBL', name: 'Kablo Çekimi', category: 'Montaj' },
        { code: 'TRA-BNA', name: 'Trafo Binaları', category: 'Trafo' },
        { code: 'TRA-PNO', name: 'Pano Montajı', category: 'Trafo' },
        { code: 'TRA-TPR', name: 'Topraklama', category: 'Trafo' },
        { code: 'TES-MGR', name: 'Meger Testleri', category: 'Test' },
        { code: 'TES-RLE', name: 'Röle Testleri', category: 'Test' },
        { code: 'KAP-DLG', name: 'Geri Dolgu', category: 'Test' },
        { code: 'TES-ENR', name: 'Enerjilendirme', category: 'Test' }
    ]
};

const PROJECT_TYPES = ['road', 'sewage', 'gas', 'electricity'];
let userCounter = 1;

function generateUserId() {
    return `USR-${String(userCounter++).padStart(4, '0')}`;
}

async function main() {
    console.log('Wiping database...');
    await prisma.activity.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Database wiped. Generating hierarchy...');
    const users = [];
    const projects = [];
    const activities = [];

    // Admin
    users.push({
        id: generateUserId(),
        name: 'Super Admin',
        role: 'admin',
        assignedLocationId: null
    });
    users.push({
        id: generateUserId(),
        name: 'Company Owner',
        role: 'owner',
        assignedLocationId: null
    });

    for (const country of COUNTRIES) {
        // Create 1 Country Manager
        const countryManagerId = generateUserId();
        users.push({
            id: countryManagerId,
            name: `${country.name} Country Director`,
            role: 'country_manager',
            assignedLocationId: country.name
        });

        for (const city of country.cities) {
            // Create 1 City Manager
            const cityCode = city.substring(0, 3).toUpperCase();
            const cityManagerId = generateUserId();
            users.push({
                id: cityManagerId,
                name: `${city} Operations Head`,
                role: 'city_manager',
                assignedLocationId: city
            });

            // Dictionary to track per-category index within this city
            const categoryIndexTracker = {};

            // Create 4-6 projects per city (let's do 4)
            for (let i = 1; i <= 4; i++) {
                const type = PROJECT_TYPES[Math.floor(Math.random() * PROJECT_TYPES.length)];
                const typeCode = type.substring(0, 3).toUpperCase();

                categoryIndexTracker[typeCode] = (categoryIndexTracker[typeCode] || 0) + 1;
                const projectLocalCount = categoryIndexTracker[typeCode];

                const projectId = `${country.code}-${cityCode}-${typeCode}-${String(projectLocalCount).padStart(2, '0')}`;
                const siteId = `SITE-${cityCode}-${String(i).padStart(2, '0')}`;

                // Site Manager
                const siteManagerId = generateUserId();
                users.push({
                    id: siteManagerId,
                    name: `${city} Site Manager ${i} `,
                    role: 'site_manager',
                    assignedLocationId: siteId
                });

                const statuses = ['planning', 'in_progress', 'completed', 'delayed'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                projects.push({
                    id: projectId,
                    name: `${city} ${type.charAt(0).toUpperCase() + type.slice(1)} Project ${i}`,
                    type: type,
                    country: country.name,
                    region: 'Central',
                    city: city,
                    location: `${city}, ${country.name}`,
                    siteId: siteId,
                    status: status,
                    budget: Math.floor(Math.random() * 5000000) + 1000000,
                    startDate: '2024-01-10',
                    endDate: '2026-12-31',
                    progress: status === 'completed' ? 100 : (status === 'planning' ? 0 : Math.floor(Math.random() * 80) + 10),
                    assigneeId: siteManagerId
                });

                // Generate Activities (10-15 based on template)
                const templates = TEMPLATES[type];
                let prevId = null;
                for (let j = 0; j < templates.length - 2; j++) { // taking ~12 activities
                    const t = templates[j];
                    const activityId = `${projectId}-${t.code}`;

                    activities.push({
                        id: activityId,
                        projectId: projectId,
                        name: t.name,
                        category: t.category,
                        status: Math.random() > 0.6 ? 'completed' : 'active',
                        startDate: '2024-01-15',
                        endDate: '2024-10-20',
                        predecessors: prevId ? prevId : '',
                        successors: '',
                        assigneeId: siteManagerId
                    });
                    prevId = activityId;
                }
            }
        }
    }

    // Insert Users
    console.log(`Inserting ${users.length} users sequentially...`);
    for (const u of users) {
        await prisma.user.create({ data: u });
    }

    // Insert Projects
    console.log(`Inserting ${projects.length} projects sequentially...`);
    for (const p of projects) {
        await prisma.project.create({ data: p });
    }

    // Insert Activities
    console.log(`Inserting ${activities.length} activities sequentially...`);
    for (const a of activities) {
        await prisma.activity.create({ data: a });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
