
// تسجيل دخول فعلي باستخدام Firebase Auth
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBFmmRCqxGeF8TQX-QSd6QHz4CpmFy_gk",
  authDomain: "fahad-booking.firebaseapp.com",
  projectId: "fahad-booking",
  storageBucket: "fahad-booking.appspot.com",
  messagingSenderId: "817478284659",
  appId: "1:817478284659:web:a32b9822166980ef688106"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [employees, setEmployees] = useState(["منى", "سارة", "نورة"]);

  useEffect(() => {
    onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) fetchBookings();
    });
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("فشل تسجيل الدخول");
    }
  };

  const fetchBookings = async () => {
    const snapshot = await getDocs(collection(db, "bookings"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBookings(data);
  };

  const updateBooking = async (id, payload) => {
    await updateDoc(doc(db, "bookings", id), payload);
    fetchBookings();
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  const filtered = bookings.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) &&
    (!filterDate || b.date === filterDate)
  );

  const todayCount = bookings.filter(b => isToday(b.date)).length;

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
        <h2>تسجيل دخول الموظف</h2>
        <input placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, margin: 4 }} />
        <input placeholder="كلمة المرور" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 8, margin: 4 }} />
        <button onClick={login} style={{ padding: 10, background: '#000', color: '#fff' }}>دخول</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>لوحة تحكم الموظفين</h2>
      <div style={{ margin: '16px 0' }}>
        <input placeholder="بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: 8 }} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th>الاسم</th>
            <th>الخدمة</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الموظفة</th>
            <th>تعديل</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>{b.name}</td>
              <td>{b.service}</td>
              <td>{b.date}</td>
              <td>{b.status}</td>
              <td>{b.employee || "-"}</td>
              <td>
                <select defaultValue={b.status} onChange={e => updateBooking(b.id, { status: e.target.value })}>
                  <option value="جديد">جديد</option>
                  <option value="مقبول">مقبول</option>
                  <option value="تم">تم</option>
                  <option value="ملغي">ملغي</option>
                </select>
                <select defaultValue={b.employee || ""} onChange={e => updateBooking(b.id, { employee: e.target.value })}>
                  <option value="">إسناد إلى...</option>
                  {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
