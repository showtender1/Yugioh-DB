import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:id" element={<CardDetail />} />
      </Routes>
    </Router>
  );
}

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' 또는 'archetype'
  const [cardData, setCardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [cardType, setCardType] = useState(''); // 카드 타입 필터링 상태

  const handleSearch = async () => {
    setError(null);
    setCardData([]);
    setFilteredData([]);
    try {
      const endpoint =
        searchType === 'name'
          ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${searchQuery}`
          : `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${searchQuery}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('카드를 찾을 수 없습니다.');
      const data = await response.json();
      setCardData(data.data);
      setFilteredData(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filterByType = (type) => {
    setCardType(type);
    if (type === '') {
      setFilteredData(cardData); // 모든 카드 보기
    } else {
      const filtered = cardData.filter(card => card.type.includes(type));
      setFilteredData(filtered);
    }
  };

  return (
    <div className="app">
      <h1>유희왕 카드 검색</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-select"
        >
          <option value="name">카드명</option>
          <option value="archetype">테마군</option>
        </select>
        <button onClick={handleSearch} className="search-button">검색</button>
      </div>

      <div className="filter-buttons">
        <button onClick={() => filterByType('')} className="filter-button">모두 보기</button>
        <button onClick={() => filterByType('Normal')} className="filter-button">일반</button>
        <button onClick={() => filterByType('Effect')} className="filter-button">효과</button>
        <button onClick={() => filterByType('Fusion')} className="filter-button">융합</button>
        <button onClick={() => filterByType('Ritual')} className="filter-button">의식</button>
        <button onClick={() => filterByType('Synchro')} className="filter-button">싱크로</button>
        <button onClick={() => filterByType('XYZ')} className="filter-button">엑시즈</button>
        <button onClick={() => filterByType('Link')} className="filter-button">링크</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="card-container">
        {filteredData.map((card) => (
          <Link key={card.id} to={`/card/${card.id}`} className="card">
            <img src={card.card_images[0].image_url} alt={card.name} className="card-image" />
            <h2>{card.name}</h2> {/* 카드명 표시 */}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
        if (!response.ok) throw new Error('카드 정보를 가져올 수 없습니다.');
        const data = await response.json();
        setCard(data.data[0]);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCardData();
  }, [id]);

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="card-detail">
      <button onClick={() => navigate('/')} className="back-button">뒤로 가기</button>
      {card ? (
        <>
          <h1>{card.name}</h1>
          <img src={card.card_images[0].image_url} alt={card.name} className="card-detail-image" />
          <p><strong>타입:</strong> {card.type}</p>
          <p><strong>속성:</strong> {card.attribute || 'N/A'}</p>
          <p><strong>레벨/랭크:</strong> {card.level || card.rank || 'N/A'}</p>
          <p><strong>공격력:</strong> {card.atk}</p>
          <p><strong>수비력:</strong> {card.def || 'N/A'}</p>
          <p><strong>종류:</strong> {card.race}</p>
          <p><strong>카드 설명:</strong> {card.desc}</p>
        </>
      ) : (
        <p>카드 정보를 불러오는 중...</p>
      )}
    </div>
  );
}

export default App;
