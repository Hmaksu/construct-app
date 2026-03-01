export interface ActivityTemplate {
    code: string;
    name: string;
    category: string;
}

export const ROAD_TEMPLATES: ActivityTemplate[] = [
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
    { code: 'TAM-KBL', name: 'Geçici Kabul ve Açılış', category: 'Tamamlama ve Trafik Güvenliği' },
];

export const SEWAGE_TEMPLATES: ActivityTemplate[] = [
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
    { code: 'KAP-YZY', name: 'Yüzey Kaplama Onarımı', category: 'Kapatma' },
];

export const GAS_TEMPLATES: ActivityTemplate[] = [
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
    { code: 'KAP-DVR', name: 'Devreye Alma', category: 'Teslim' },
];

export const ELECTRICITY_TEMPLATES: ActivityTemplate[] = [
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
    { code: 'TES-ENR', name: 'Enerjilendirme', category: 'Test' },
];

export const PROJECT_TEMPLATES: Record<string, ActivityTemplate[]> = {
    road: ROAD_TEMPLATES,
    sewage: SEWAGE_TEMPLATES,
    gas: GAS_TEMPLATES,
    electricity: ELECTRICITY_TEMPLATES,
    other: [],
};
