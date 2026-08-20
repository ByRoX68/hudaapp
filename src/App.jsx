import { useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import Ayetler from '@/pages/Ayetler';
import Hadisler from '@/pages/Hadisler';
import EvliyaSozleri from '@/pages/EvliyaSozleri';
import NamazVakitleri from '@/pages/NamazVakitleri';
import KiblePusulasi from '@/pages/KiblePusulasi';
import HicriTakvim from '@/pages/HicriTakvim';
import Ayarlar from '@/pages/Ayarlar';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// DEV EVLİYAULLAH VE İMAMLAR BİLDİRİM KÜTÜPHANESİ
// Şeyh İzzettin el-Urfevî (k.s.) sözleri algoritmanın sık seçmesi adına havuza yüksek yoğunlukta dağıtılmıştır.
const notificationPool = [
  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - SIK ÇIKMASI İÇİN YOĞUNLAŞTIRILMIŞ KATMAN ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Ey bu dünyadan ukbaya yürüyen yolcu! Haritan Kur'an, pusulan Sünnet, refikin Sahabe, azığın sadık dostlar olsun." },
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Kalp ancak zikrullah ile cilalanır; pas tutmuş bir kalbe nurların tecellisi imkansızdır." },
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Amelde ihlas yoksa, o amel rüzgardaki savrulan kuru yaprak gibidir; sahibine fayda vermez." },
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Kula gereken sabırdır. Sabır, acıyı yutmak ama yüzünü ekşitmemektir." },
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Gözün haramdan korunması, kalbe açılan en büyük rahmet kapısıdır." },

  // === ŞEYH NAZIM KIBRISÎ (K.S.) ===
  { title: "HüdâAPP • Şeyh Nazım Kıbrısî", text: "Hiçbir şey boşuna yaratılmamıştır. Olan biten her şey Allah'ın rızası ve iradesi iledir." },
  { title: "HüdâAPP • Şeyh Nazım Kıbrısî", text: "İslam'ın özü edeptir. Edepli olan her kapıdan geçer, edepsiz olan her kapıda kalır." },
  { title: "HüdâAPP • Şeyh Nazım Kıbrısî", text: "Kalbinizi dünyaya bağlamayın; dünya bir gölgedir, kovalarsanız kaçar, arkanızı dönerseniz takip eder." },
  { title: "HüdâAPP • Şeyh Nazım Kıbrısî", text: "Allah deyin, gerisini bırakın. O'nun kapısı hiçbir zaman kapanmaz." },
  { title: "HüdâAPP • Şeyh Nazım Kıbrısî", text: "Nefsin arzuları zehirlidir, ruhu öldürür; ruhun gıdası ise secdede gözyaşı dökmektir." },

  // === ABDULLAH BİN HUBEYK (K.S.) / ABDULLAH BİN MÜBÂREK (K.S.) ===
  { title: "HüdâAPP • Abdullah bin Hubeyk", text: "Şeref ve vakar, Allah'a itaat etmekle kazanılır; günah işleyerek izzet arayan zillet bulur." },
  { title: "HüdâAPP • Abdullah bin Mübârek", text: "Ben kalpten daha zor tedavi edilen bir şey görmedim. O her an değişebilir." },
  { title: "HüdâAPP • Abdullah bin Mübârek", text: "Biz çok ilimden ziyade, az da olsa edebe muhtacız." },

  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - ARALARA SERPİŞTİRİLEN DESTEK KATMANI ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Haritan Kur'an, pusulan Sünnet olsun. Ancak bu şekilde selamet sahiline ulaşırsın." },

  // === ABDULLAH DEHLEVÎ (K.S) / ABDURRAHMAN GÜRSES ===
  { title: "HüdâAPP • Abdullah Dehlevî", text: "Gönül, Allahü Teâlâ'nın tecelli yeridir. Oraya O'ndan başkasının sevgisini sokmak yazıktır." },
  { title: "HüdâAPP • Abdurrahman Gürses", text: "Kur'an'ı sadece sesinizle değil, ahlakınız ve yaşantınızla da tezyin edin." },

  // === ABDULVÂHİD BİN ZEYD (K.S.) / ABDÜLAZİZ BEKKİNE ===
  { title: "HüdâAPP • Abdulvâhid bin Zeyd", text: "Dünyadan zühd etmek kalbi rahatlatır; dünyaya rağbet etmek ise endişe ve kederi artırır." },
  { title: "HüdâAPP • Abdülaziz Bekkine", text: "Müslüman, her işinde Allah'ın muradını arayan akıl küpüdür." },

  // === ABDÜLHAKİM ARVASİ / ABDÜLHÂLIK GUCDÜVÂNÎ ===
  { title: "HüdâAPP • Abdülhakim Arvasi", text: "İhlas, amellerin ruhudur. Ruhsuz beden ne ise, ihlassız amel de odur." },
  { title: "HüdâAPP • Abdülhâlık Gucdüvânî", text: "Her nefeste uyanık ol (Hûş der dem); Allah'tan gafil geçen nefes zayidir." },

  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - ARALARA SERPİŞTİRİLEN DESTEK KATMANI ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Azığın sadık dostlar olsun. Sadıklarla beraber olmak kalbe şifa, ruha ciladır." },

  // === ABDÜLKADİR-İ GEYLANİ (K.S.) ===
  { title: "HüdâAPP • Abdülkadir-i Geylani", text: "Kalp doğru olunca iman doğru olur; dil doğru olunca da kalp doğru olur." },
  { title: "HüdâAPP • Abdülkadir-i Geylani", text: "Mümin, dünyayı ahirete köprü yapar; ahireti dünyaya feda etmez." },
  { title: "HüdâAPP • Abdülkadir-i Geylani", text: "Hakka kul olan, mahlukata kul olmaktan kurtulur." },

  // === AHMED BİN EBİ'L HAVARÎ / AHMED BİN HADRAVEYH / AHMED BİN HARB ===
  { title: "HüdâAPP • Ahmed bin Ebi'l Havarî", text: "Dünya sevgisi kalbe yerleşince, ahiret korkusu oradan göç eder." },
  { title: "HüdâAPP • Ahmed bin Hadraveyh", text: "En büyük hicap, kulun kendisini ameliyle hak sahibi görmesidir." },
  { title: "HüdâAPP • Ahmed bin Harb", text: "Gökyüzüne bakıp ibret almayan göz, taştan daha katıdır." },

  // === AHMED İBN ASIM ANTÂKİ / AHMET ER-RUFAİ ===
  { title: "HüdâAPP • Ahmed İbn Asım", text: "Faydalı ilim, kalbe huşu ve korku veren ilimdir." },
  { title: "HüdâAPP • Ahmet Er-Rufai", text: "Kibrin girdiği kalpten marifetullah çıkar. Tevazu ehli olun." },
  { title: "HüdâAPP • Ahmet Er-Rufai", text: "Herkes bir yol aradı; ben Allah'a giden yollar içinde acziyet ve noksanlıktan daha kestirme bir yol görmedim." },

  // === AKŞEMSEDDİN / ALÂÜDDÎN ATTÂR / ALİ BİN SEHL ===
  { title: "HüdâAPP • Akşemseddin", text: "Her işe besmele ile başla. Kendini bırakma, nefse uyanlardan olma." },
  { title: "HüdâAPP • Alâüddîn Attâr", text: "Mürşidin rızası, Allah'ın rızasına ulaştıran mukaddes bir vesiledir." },
  { title: "HüdâAPP • Ali Bin Sehl İsfahânî", text: "Zikir, kalbin uyanık kalmasıdır. Gafil kalp şeytanın yuvasıdır." },

  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - ARALARA SERPİŞTİRİLEN DESTEK KATMANI ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Kalp pas tutarsa nurların tecellisi durur. Kalbini tövbe suyuyla yıka." },

  // === ALİ RÂMİTENÎ / AMR BİN OSMAN / AZİZ MAHMUD HÜDAYİ ===
  { title: "HüdâAPP • Ali Râmîtenî", text: "Halkı razı etmek zordur; sen Hak rızasını gözet, Hak razı olunca halkı da razı eder." },
  { title: "HüdâAPP • Amr bin Osman", text: "Tasavvuf, vakti en hayırlı ve en kıymetli amelle değerlendirmektir." },
  { title: "HüdâAPP • Aziz Mahmud Hüdayi", text: "Alan sensin, veren sensin, kılan sen. Ne verdinse odur, dahi nemiz var." },

  // === BAHAEDDIN VELED / BAHÂÜDDÎN ŞÂH-I NAKŞİBEND ===
  { title: "HüdâAPP • Bahaeddin Veled", text: "Gönül gözü açık olan, her zerrede Allah'ın bir mucizesini müşahede eder." },
  { title: "HüdâAPP • Şah-ı Nakşibend", text: "Bizim yolumuz sohbet yoludur. Hayır ise cemiyettedir; yalnızlıkta şöhret afet vardır." },
  { title: "HüdâAPP • Şah-ı Nakşibend", text: "Dışın halk ile, için Hak ile olsun (Halvet der encümen)." },

  // === BÂYEZİD BİSTÂMÎ / BİŞR HAFİ ===
  { title: "HüdâAPP • Bâyezîd-i Bistâmî", text: "Dilini Allah'ı anmaya alıştır ki, boş ve gıybet sözlere vakit kalmasın." },
  { title: "HüdâAPP • Bâyezîd-i Bistâmî", text: "Otuz yıldır ibadet ederim; en zorlandığım şey ihlası korumak oldu." },
  { title: "HüdâAPP • Bişr Hafi", text: "Şöhreti seven, Allah'tan hakkıyla korkmamış demektir." },

  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - ARALARA SERPİŞTİRİLEN DESTEK KATMANI ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Amelde ihlas yoksa amel kuru bir yapraktır. Yaptığın her işi sadece O'nun için yap." },

  // === CÂFER HULDÎ / CÂFER-İ SÂDIK / CÜNEYD BAĞDÂDÎ ===
  { title: "HüdâAPP • Câfer-i Sâdık", text: "Günah işlediğinde hemen arkasından tövbe et ki, kalbinde siyah leke kalmasın." },
  { title: "HüdâAPP • Cüneyd Bağdâdî", text: "Bizim tasavvuf ilmimiz Kur'an ve Sünnet ile kayıtlıdır. Bu iki asra uymayan yol batıldır." },
  { title: "HüdâAPP • Dâvud Tâi", text: "Dünyadan elini çek ki, ahirette yüzün ak olsun." },

  // === ERZURUMLU İBRAHİM HAKKI / FUDAYL BİN IYAD / GÖNENLİ MEHMET EFENDİ ===
  { title: "HüdâAPP • İbrahim Hakkı", text: "Mevla görelim neyler, neylerse güzel eyler." },
  { title: "HüdâAPP • Fudayl bin Iyad", text: "İnsanların hatırı için ameli terk etmek riyadır; riya için amel etmek ise şirktir." },
  { title: "HüdâAPP • Gönenli Mehmet Efendi", text: "Evladım, Kur'an'a hadim olun. Kur'an'a hizmet edenin işini Allah zayi etmez." },

  // === ŞEYH İZZETTİN EL URFEVİ (K.S.) - ARALARA SERPİŞTİRİLEN DESTEK KATMANI ===
  { title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Haritan Kur'an, pusulan Sünnet, refikin Sahabe, azığın sadık dostlar olsun!" },

  // === HACI BAYRAM-I VELİ / HASAN BASRÎ / HOCA AHMED YESEVİ ===
  { title: "HüdâAPP • Hacı Bayram-ı Veli", text: "Bilmek istersen sen seni, can içinde ara canı. Geç canından bul cananı." },
  { title: "HüdâAPP • Hasan Basrî", text: "Dünya rüya gibidir; içindekiler aldanır, ölüm uyarınca her şey biter." },
  { title: "HüdâAPP • Ahmed Yesevi", text: "Sünnet imiş, kafir de olsa incitme sen; huda bizardır katı yürekli gönül kırandan." },

  // === İBRAHİM EDHEM / İMAM EBU HANİFE / İMAM GAZALİ ===
  { title: "HüdâAPP • İbrahim Edhem", text: "Haram lokma yiyenin kalbi kararır, ibadetin lezzetini alamaz." },

{ title: "HüdâAPP • İmam Ebu Hanife", text: "İlim, amel etmek içindir; amel edilmeyen ilim, meyvesiz ağaca benzer." },
{ title: "HüdâAPP • İmam Gazali", text: "Kalp bir cam gibidir; günahlar onu kirletir, zikir ve tövbe ise cilalar." },
{ title: "HüdâAPP • İmam Gazali", text: "Bilemezsin ki sana gelen bela belki de bir rahmet kamçısıdır." },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder. (Nahl, 90)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, sabredenlerle beraberdir. (Bakara, 153)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur. (Ra'd, 28)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Gevşemeyin, hüzünlenmeyin. Eğer inanıyorsanız üstünsünüzdür. (Âl-i İmrân, 139)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Allah bana yeter, O ne güzel vekildir. (Âl-i İmrân, 173)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "İyiliğin karşılığı, yalnız iyilik değil midir? (Rahmân, 60)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "De ki: Hak geldi, batıl yok oldu. Şüphesiz batıl yok olmaya mahkumdur. (İsrâ, 81)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "İnsan için ancak çalıştığının karşılığı vardır. (Necm, 39)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kolaylığı seç, iyiliği emret ve cahillerden yüz çevir. (A'râf, 199)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz her güçlükle beraber bir kolaylık vardır. (İnşirâh, 5)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Gerçekten güçlükle beraber kolaylık vardır. (İnşirâh, 6)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Rabbim! Göğsümü genişlet, işimi kolaylaştır. (Tâhâ, 25-26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kullarıma söyle, sözün en güzelini söylesinler. (İsrâ, 53)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "O, amel bakımından hanginizin daha iyi olduğunu denemek için ölümü ve hayatı yaratandır. (Mülk, 2)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Küçümseyerek surat asıp insanlardan yüz çevirme ve yeryüzünde böbürlenerek yürüme. (Lokmân, 18)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, kibirlenenleri ve övünenleri sevmez. (Lokmân, 18)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Yürüyüşünde ölçülü ol, sesini de kıs. (Lokmân, 19)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kim Allah'a tevekkül ederse, O kendisine yeter. (Talâk, 3)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Güzel bir söz ve bağışlama, peşinden gönül kırma gelen bir sadakadan daha hayırlıdır. (Bakara, 263)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ey iman edenler! Sabrederek ve namaz kılarak Allah'tan yardım dileyin. (Bakara, 153)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Siz ne hayır yaparsanız, şüphesiz Allah onu bilir. (Bakara, 215)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Bir işe azmettiğin zaman, artık Allah'a tevekkül et. (Âl-i İmrân, 159)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, kendisine tevekkül edenleri sever. (Âl-i İmrân, 159)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Onlar bollukta da darlıkta da Allah için harcarlar ve öfkelerini yutarlar. (Âl-i İmrân, 134)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Allah, iyilik edenleri sever. (Âl-i İmrân, 134)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Sevdiğiniz şeylerden Allah yolunda harcamadıkça iyiliğe eremezsiniz. (Âl-i İmrân, 92)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Allah, hiç kimseye gücünün üstünde bir şey yüklemez. (Bakara, 286)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ey Rabbimiz! Unutur ya da yanılırsak bizi sorumlu tutma. (Bakara, 286)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Hakkı batılla karıştırmayın ve bile bile hakkı gizlemeyin. (Bakara, 42)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "İyilik ve takva üzere yardımlaşın, günah ve düşmanlık üzere yardımlaşmayın. (Mâide, 2)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Eğer şükrederseniz, elbette size nimetimi artırırım. (İbrâhîm, 7)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ey iman edenler! Allah'tan korkun ve doğrularla beraber olun. (Tevbe, 119)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Rabbiniz şöyle buyurdu: Bana dua edin, duanıza cevap vereyim. (Mü'min, 60)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kim bir iyilik yaparsa, ona on katı verilir. (En'âm, 160)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz iyilikler, kötülükleri giderir. (Hûd, 114)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Andolsun, insanı biz yarattık ve nefsinin ona ne fısıldadığını biliriz. (Kâf, 16)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Çünkü biz ona şah damarından daha yakınız. (Kâf, 16)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ey iman edenler! Zannın çoğundan kaçının. Çünkü zannın bir kısmı günahtır. (Hucurât, 12)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Birbirinizin kusurunu araştırmayın. (Hucurât, 12)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kimse kimsenin gıybetini yapmasın. (Hucurât, 12)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Müminler ancak kardeştirler. Öyleyse kardeşlerinizin arasını düzeltin. (Hucurât, 10)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Hiçbir günahkar, başkasının günahını yüklenmez. (Fâtır, 18)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Yeryüzünde yürüyen hiçbir canlı yoktur ki, rızkı Allah'a ait olmasın. (Hûd, 6)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Nerede olursanız olun, O sizinle beraberdir. (Hadîd, 4)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, yaptıklarınızı hakkıyla görendir. (Hadîd, 4)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ey Rabbimiz! Bize dünyada da iyilik ver, ahirette da iyilik ver. (Bakara, 201)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Bizi cehennem azabından koru. (Bakara, 201)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Allah, bozgunculuk yapanları sevmez. (Mâide, 64)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Rabbin, sadece kendisine kulluk etmenizi ve ana-babanıza iyi davranmanızı emretti. (İsrâ, 23)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Eğer onlardan biri ya da her ikisi yaşlanırsa, onlara 'öf' bile deme. (İsrâ, 23)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Onları azarlama; onlara güzel ve tatlı söz söyle. (İsrâ, 23)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Onlara merhamet ederek tevazu kanatlarını indir. (İsrâ, 24)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "De ki: Rabbim! Küçüklüğümde onlar beni nasıl yetiştirdilerse, şimdi de sen onlara merhamet et. (İsrâ, 24)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Akrabaya, yoksula ve yolda kalmışa hakkını ver. (İsrâ, 26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Gereksiz yere de saçıp savurma. (İsrâ, 26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Eli sıkı olma, büsbütün eli açık da olma. (İsrâ, 29)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Hakkında bilgin olmayan şeyin peşine düşme. (İsrâ, 36)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Çünkü kulak, göz ve kalp, bunların hepsi ondan sorumludur. (İsrâ, 36)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Yeryüzünde böbürlenerek yürüme. (İsrâ, 37)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Çünkü sen ne yeri yarabilirsin, ne da boyca dağlara erişebilirsin. (İsrâ, 37)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ölçtüğünüz zaman tas tamam ölçün ve doğru teraziyle tartın. (İsrâ, 35)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Kötülüğü en güzel olan şeyle sav. (Fussilet, 34)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "O zaman bakarsın ki seninle arasında düşmanlık bulunan kimse, sımsıcak bir dost oluvermiş. (Fussilet, 34)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, haddi aşanları sevmez. (Bakara, 190)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Dinde zorlama yoktur. (Bakara, 256)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz doğruluk, sapıklıktan tamamen ayrılmıştır. (Bakara, 256)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Öyleyse yetimi sakın ezme. (Duhâ, 9)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "İsteyeni/yoksulu sakın azarlama. (Duhâ, 10)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Ve Rabbinin nimetini minnet ve şükranla an. (Duhâ, 11)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "De ki: Ey mülkün sahibi olan Allah'ım! Sen mülkü dilediğine verirsin. (Âl-i İmrân, 26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Mülkü dilediğinden çekip alırsın. Dilediğini aziz eder, dilediğini zelil edersin. (Âl-i İmrân, 26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Hayır senin elindedir. Şüphesiz sen her şeye hakkıyla gücü yetensin. (Âl-i İmrân, 26)" },
  { title: "HüdâAPP • Ayet-i Kerîme", text: "Geceyi gündüze sokarsın, gündüzü geceye sokarsın. (Âl-i İmrân, 27)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Ölüden diriyi çıkarır, diriden ölüyü çıkarırsın. (Âl-i İmrân, 27)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Dilediğini hesapsızca rızıklandırırsın. (Âl-i İmrân, 27)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "De ki: Ey kendilerine kötülük edip günahta haddi aşan kullarım! Allah'ın rahmetinden ümidinizi kesmeyin. (Zümer, 53)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, bütün günahları bağışlar. Çünkü O, çok bağışlayandır, çok merhamet edendir. (Zümer, 53)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "İnsanları arkalarından çekiştirenlerin, yüzlerine karşı eğlenenlerin vay haline! (Hümeze, 1)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Asra yemin olsun ki, insan mutlaka ziyandadır. (Asr, 1-2)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Ancak iman edip salih ameller işleyenler, birbirlerine hakkı ve sabrı tavsiye edenler müstesna. (Asr, 3)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz insan için kendi çalışmasından başka bir şey yoktur. (Necm, 39)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Ve çalışması yakında görülecektir. (Necm, 40)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Sonra ona karşılığı tas tamam verilecektir. (Necm, 41)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz en son varış Rabbinedir. (Necm, 42)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Güldüren de O'dur, ağlatan da O'dur. (Necm, 43)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Öldüren de O'dur, dirilten da O'dur. (Necm, 44)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "O, hanginizin daha güzel amel yapacağını sınamak için ölümü ve hayatı yaratandır. (Mülk, 2)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "O, mutlak güç sahibidir, çok bağışlayandır. (Mülk, 2)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Sana gelen her iyilik Allah'tandır. Kötülük ise nefsindendir. (Nisâ, 79)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, insanlara hiçbir şeyle zulmetmez; fakat insanlar kendi kendilerine zulmederler. (Yûnus, 44)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Allah, hiç kimseye gücünün yeteceğinden fazlasını yüklemez. (Bakara, 286)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Beni anın ki ben de sizi anayım. Bana şükredin, nankörlük etmeyin. (Bakara, 152)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Eğer şükrederseniz, elbette size nimetimi artırırım. (İbrâhîm, 7)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Eğer nankörlük ederseniz, hiç şüphesiz benim azabım çok çetindir. (İbrâhîm, 7)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Şüphesiz Allah, çok tövbe edenleri sever ve çok temizlenenleri sever. (Bakara, 222)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Rabbinizin bağışlamasına ve genişliği göklerle yer arası kadar olan cennete koşun. (Âl-i İmrân, 133)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "O cennet, Allah'a karşı gelmekten sakınanlar için hazırlanmıştır. (Âl-i İmrân, 133)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Onlar bollukta da darlıkta da Allah rızası için harcarlar. (Âl-i İmrân, 134)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Öfkelerini yutarlar ve insanları affederler. Allah, iyilik edenleri sever. (Âl-i İmrân, 134)" },
{ title: "HüdâAPP • Ayet-i Kerîme", text: "Sizden, hayra çağıran, iyiliği emreden ve kötülükten men eden bir topluluk bulunsun. (Âl-i İmrân, 104)" },
// === İMÂM-I RABBÂNÎ / MEVLANA HAZRETLERİ / YUNUS EMRE ===
{ title: "HüdâAPP • İmâm-ı RabbânÎ", text: "Sünnete ittiba etmek, evliyalık makamlarının en üstününe ulaştırır." },
{ title: "HüdâAPP • Mevlana Hazretleri", text: "Gel, gel, ne olursan ol yine gel. Bizim dergahımız ümitsizlik dergahı değildir." },
{ title: "HüdâAPP • Yunus Emre", text: "Ete kemiğe büründüm, Yunus diye göründüm. Sevelim sevilelim, dünya kimseye kalmaz." },
// === ŞEYH İZZETTİN EL URFEVİ (K.S.) - SON KAPLAMA KATMANI ===
{ title: "HüdâAPP • Şeyh İzzettin el-Urfevî", text: "Sabır acıyı yutmaktır ama yüzünü ekşitmemektir. Kadere rıza göster." }
];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ayetler" element={<Ayetler />} />
            <Route path="/hadisler" element={<Hadisler />} />
            <Route path="/evliya" element={<EvliyaSozleri />} />
            <Route path="/namaz" element={<NamazVakitleri />} />
            <Route path="/kible" element={<KiblePusulasi />} />
            <Route path="/takvim" element={<HicriTakvim />} />
            <Route path="/ayarlar" element={<Ayarlar />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
};

function App() {
  useEffect(() => {
    const setupAppFeatures = async () => {
      try {
        const locStatus = await Geolocation.checkPermissions();
        if (locStatus.location !== 'granted') await Geolocation.requestPermissions();

        const notifStatus = await LocalNotifications.checkPermissions();
        if (notifStatus.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') return;
        }

        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }

        const notificationsToSchedule = [];

        for (let i = 1; i <= 24; i++) {
          const contentIndex = (Math.floor(Math.random() * notificationPool.length) + i) % notificationPool.length;
          const content = notificationPool[contentIndex];
          const triggerDate = new Date();
          triggerDate.setHours(triggerDate.getHours() + i);
          triggerDate.setMinutes(0);
          triggerDate.setSeconds(0);

          notificationsToSchedule.push({
            id: 2000 + i,
            title: content.title,
            body: content.text,
            schedule: {
              at: triggerDate,
              allowWhileIdle: true
            },
            sound: 'default',
            actionTypeId: 'OPEN_APP'
          });
        }

        await LocalNotifications.schedule({
          notifications: notificationsToSchedule
        });
        console.log("24 Saatlik yoğunlaştırılmış evliyaullah bildirim havuzu kuruldu.");
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    setupAppFeatures();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;