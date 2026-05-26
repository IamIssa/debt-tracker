import { useEffect, useMemo, useState } from 'react';

export default function DebtTracker() {
  const storageKey = 'debt-tracker-progress';

  const sections = [
    {
      title: 'Month 1 Payday',
      items: [
        'Rent — R1,500',
        'Mom — R2,500',
        'Electricity — R500',
        'WiFi — R551',
        'Haircut — R400',
        'Funeral cover — R250',
        'Friend graduation savings — R500',
      ],
    },
    {
      title: 'Month 2 Payday',
      items: [
        'Credit Card — R7,800',
        'Emergency Fund — R2,599',
      ],
    },
    {
      title: 'Month 3 Payday',
      items: [
        'Credit Card FINAL — R1,200',
        'Get R0 screenshot',
        'Give notice',
      ],
    },
    {
      title: 'Month 4+ New Life',
      items: [
        'Rent-to-buy — R3,950',
        'TFSA — R4,000',
        'House Deposit — R3,799',
      ],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);

  const [checked, setChecked] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setChecked(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked]);

  const completedCount = useMemo(() => {
    return Object.values(checked).filter(Boolean).length;
  }, [checked]);

  const progress = Math.round((completedCount / allItems.length) * 100);

  const toggleItem = (key) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial',
        background: '#f3f4f6',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '20px',
          }}
        >
          <h1>Debt-Free + Move With Mom</h1>
          <p>Income: R19,400/month</p>

          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div
              style={{
                background: '#ddd',
                height: '14px',
                borderRadius: '20px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  background: 'black',
                  height: '14px',
                }}
              />
            </div>
          </div>
        </div>

        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '20px',
              marginBottom: '20px',
            }}
          >
            <h2>{section.title}</h2>

            {section.items.map((item, idx) => {
              const itemKey = `${section.title}-${idx}`;

              return (
                <label
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '12px',
                    marginTop: '10px',
                    borderRadius: '12px',
                    background: checked[itemKey]
                      ? '#dcfce7'
                      : '#f9fafb',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[itemKey]}
                    onChange={() => toggleItem(itemKey)}
                  />

                  <span
                    style={{
                      textDecoration: checked[itemKey]
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
