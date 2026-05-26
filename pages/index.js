import { useEffect, useMemo, useRef, useState } from 'react';

export default function FinancialFreedomTracker() {
  const storageKey = 'financial-freedom-tracker';

  const financialData = {
    income: 19400,
    debtRemaining: 9000,
    emergencyFund: 1799,
    houseDeposit: 0,
    freeCash: 0,
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);

  const sections = [
    {
      title: 'Month 1 Payday Checklist',
      items: [
        'Rent — R1,500',
        'Mom Rent — R2,500',
        'Electricity — R500',
        'WiFi — R551',
        'Haircut — R400',
        'Funeral Cover — R250',
        'Sesi Debt Cleared — R150',
        'Ben Debt Cleared — R800',
        'Masingita Debt Cleared — R1,150',
        'Credit Card Minimum — R2,800',
        'Credit Card Extra — R5,000',
        'Emergency Fund — R1,799',
        'Save Proof Screenshots',
        'Verify Bank Balance',
      ],
    },
    {
      title: 'Month 2 Payday Checklist',
      items: [
        'All Bills Paid',
        'Credit Card Payment — R7,800',
        'Emergency Fund Contribution',
        'Keep Buffer Untouched',
        'Verify Credit Card Balance',
      ],
    },
    {
      title: 'Month 3 Payday Checklist',
      items: [
        'Final Credit Card Payment',
        'Get R0 Debt Screenshot',
        'Emergency Fund Boost',
        'Give Notice',
        'Confirm 2-Person Move',
        'Complete Debt-Free Status',
      ],
    },
    {
      title: 'Month 4+ Financial Stability',
      items: [
        'Rent-to-buy Payment',
        'Food Budget Managed',
        'Transport Budget Managed',
        'Emergency Fund Savings',
        'TFSA Investment',
        'House Deposit Savings',
        'Auto Debit Savings Active',
      ],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);

  const [checked, setChecked] = useState({});
  const [proofs, setProofs] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setChecked(JSON.parse(saved));
    }

    const savedProofs = localStorage.getItem(
      `${storageKey}-proofs`
    );

    if (savedProofs) {
      setProofs(JSON.parse(savedProofs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(checked)
    );
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(
      `${storageKey}-proofs`,
      JSON.stringify(proofs)
    );
  }, [proofs]);

  const completedCount = useMemo(() => {
    return Object.values(checked).filter(Boolean).length;
  }, [checked]);

  const progress = Math.round(
    (completedCount / allItems.length) * 100
  );

  const handleProofUpload = (key, file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProofs((prev) => ({
        ...prev,
        [key]: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

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
        background: '#f3f4f6',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h1 style={{ margin: 0 }}>
            Financial Freedom Tracker
          </h1>

          <p
            style={{
              color: '#666',
              marginTop: '8px',
            }}
          >
            Debt Elimination • Stability • Home Ownership
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            {[
              {
                title: 'Monthly Income',
                value: financialData.income,
                icon: '💰',
              },
              {
                title: 'Debt Remaining',
                value: financialData.debtRemaining,
                icon: '💳',
              },
              {
                title: 'Emergency Fund',
                value: financialData.emergencyFund,
                icon: '🛡️',
              },
              {
                title: 'House Deposit',
                value: financialData.houseDeposit,
                icon: '🏠',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f9fafb',
                  padding: '18px',
                  borderRadius: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                  }}
                >
                  {card.icon}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  {card.title}
                </p>

                <h2
                  style={{
                    marginTop: '8px',
                    marginBottom: 0,
                  }}
                >
                  {formatCurrency(card.value)}
                </h2>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span>Master Progress</span>
              <strong>{progress}%</strong>
            </div>

            <div
              style={{
                background: '#e5e7eb',
                height: '14px',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '14px',
                  background: 'black',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '18px',
              borderRadius: '18px',
            }}
          >
            <p style={{ color: '#666', margin: 0 }}>
              Mission
            </p>
            <h3>Debt-Free in 90 Days</h3>
          </div>

          <div
            style={{
              background: 'white',
              padding: '18px',
              borderRadius: '18px',
            }}
          >
            <p style={{ color: '#666', margin: 0 }}>
              Target
            </p>
            <h3>Stable Household</h3>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2>System Locks</h2>

          {[
            'No new debt until debt-free',
            'Food budget stays controlled',
            'No unnecessary online shopping',
            'All extra money goes to debt first',
            'Savings auto-transfer on payday',
            'No emotional spending',
          ].map((rule, idx) => (
            <div
              key={idx}
              style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '12px',
                marginTop: '10px',
              }}
            >
              ✅ {rule}
            </div>
          ))}
        </div>

        {sections.map((section, index) => {
          const sectionProgress = Math.round(
            (section.items.filter(
              (_, idx) =>
                checked[`${section.title}-${idx}`]
            ).length /
              section.items.length) *
              100
          );

          return (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2>{section.title}</h2>

                <div
                  style={{
                    background: 'black',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                  }}
                >
                  ACTIVE
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>Section Progress</span>
                  <strong>{sectionProgress || 0}%</strong>
                </div>

                <div
                  style={{
                    background: '#e5e7eb',
                    height: '10px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${sectionProgress || 0}%`,
                      height: '10px',
                      background: 'black',
                    }}
                  />
                </div>
              </div>

              {section.items.map((item, idx) => {
                const itemKey = `${section.title}-${idx}`;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      marginTop: '10px',
                      background: checked[itemKey]
                        ? '#dcfce7'
                        : '#f9fafb',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[itemKey]}
                        onChange={() =>
                          toggleItem(itemKey)
                        }
                        disabled={!proofs[itemKey]}
                      />

                      <span
                        style={{
                          textDecoration: checked[itemKey]
                            ? 'line-through'
                            : 'none',
                          fontWeight: '500',
                          flex: 1,
                        }}
                      >
                        {item}
                      </span>
                    </label>

                    <div style={{ marginTop: '12px' }}>
                      <input
                        ref={(el) =>
                          (fileInputRefs.current[itemKey] =
                            el)
                        }
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          handleProofUpload(
                            itemKey,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          fileInputRefs.current[
                            itemKey
                          ]?.click()
                        }
                        style={{
                          border: 'none',
                          background: 'black',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        {proofs[itemKey]
                          ? '✅ Proof Uploaded'
                          : '📸 Upload Proof'}
                      </button>
                    </div>

                    {proofs[itemKey] && (
                      <div style={{ marginTop: '14px' }}>
                        <img
                          src={proofs[itemKey]}
                          alt="Proof"
                          style={{
                            width: '100%',
                            borderRadius: '14px',
                            maxHeight: '220px',
                            objectFit: 'cover',
                          }}
                        />

                        <div
                          style={{
                            marginTop: '10px',
                            background: '#dcfce7',
                            padding: '10px',
                            borderRadius: '12px',
                            fontWeight: '600',
                          }}
                        >
                          Verification Ready ✅
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                style={{
                  marginTop: '18px',
                  background: '#f9fafb',
                  padding: '16px',
                  borderRadius: '16px',
                }}
              >
                <strong>Verification Checklist</strong>

                <div
                  style={{
                    marginTop: '10px',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  <div>☐ Payment proof saved</div>
                  <div>☐ Screenshots backed up</div>
                  <div>☐ Balances verified</div>
                  <div>☐ Month completed in app</div>
                </div>
              </div>
            </div>
          );
        })}

        <div
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2>Future Vision</h2>

          {[
            'Own your home',
            'Zero debt stress',
            'Stable household',
            'Growing investments',
            'Strong emergency reserves',
          ].map((goal, idx) => (
            <div
              key={idx}
              style={{
                background: '#f9fafb',
                padding: '14px',
                borderRadius: '14px',
                marginTop: '10px',
              }}
            >
              ⭐ {goal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}