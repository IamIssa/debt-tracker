import { useEffect, useRef, useState } from 'react';

export default function FinancialFreedomOS() {
  const STORAGE_KEY =
    'financial-freedom-os-v3';

  /* =========================
     TABS
  ========================= */

  const [activeTab, setActiveTab] =
    useState('setup');

  const [selectedMonth, setSelectedMonth] =
    useState(null);

  /* =========================
     USER INPUTS
  ========================= */

  const [income, setIncome] =
    useState('');

  const [strategy, setStrategy] =
    useState('aggressive');

  const [debtStrategy, setDebtStrategy] =
    useState('avalanche');

  const [expenses, setExpenses] =
    useState([
      {
        id: Date.now(),
        name: 'Rent',
        amount: '',
      },
    ]);

  const [debts, setDebts] =
    useState([
      {
        id: Date.now(),
        name: 'Credit Card',
        balance: '',
        interestRate: '',
        minimumPayment: '',
        targetMonths: '3',
      },
    ]);

  const [goals, setGoals] =
    useState([
      {
        id: Date.now(),
        name: 'Graduation Support',
        amount: 500,
      },
    ]);

  /* =========================
     GENERATED PLAN
  ========================= */

  const [generatedPlan, setGeneratedPlan] =
    useState(null);

  /* =========================
     EXECUTION STATE
  ========================= */

  const [checked, setChecked] =
    useState({});

  const [proofs, setProofs] =
    useState({});

  const fileInputRefs = useRef({});

  /* =========================
     FORMATTERS
  ========================= */

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  /* =========================
     LOCAL STORAGE
  ========================= */

  useEffect(() => {
    const savedPlan =
      localStorage.getItem(
        `${STORAGE_KEY}-plan`
      );

    const savedChecked =
      localStorage.getItem(
        `${STORAGE_KEY}-checked`
      );

    const savedProofs =
      localStorage.getItem(
        `${STORAGE_KEY}-proofs`
      );

    if (savedPlan) {
      const parsed =
        JSON.parse(savedPlan);

      setGeneratedPlan(parsed.plan);

      setIncome(parsed.income);

      setExpenses(parsed.expenses);

      setDebts(parsed.debts);

      setGoals(parsed.goals);

      setStrategy(parsed.strategy);

      setDebtStrategy(
        parsed.debtStrategy
      );

      setActiveTab(
        'dashboard'
      );
    }

    if (savedChecked) {
      setChecked(
        JSON.parse(savedChecked)
      );
    }

    if (savedProofs) {
      setProofs(
        JSON.parse(savedProofs)
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-checked`,
      JSON.stringify(checked)
    );
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-proofs`,
      JSON.stringify(proofs)
    );
  }, [proofs]);

  /* =========================
     CHECKLIST ENGINE
  ========================= */

  const toggleItem = (key) => {
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const uploadProof = (
    key,
    file
  ) => {
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

  /* =========================
     DEBT PRIORITY ENGINE
  ========================= */

  const sortDebts = (debtsList) => {
    const sorted = [...debtsList];

    if (
      debtStrategy === 'snowball'
    ) {
      return sorted.sort(
        (a, b) =>
          a.remainingBalance -
          b.remainingBalance
      );
    }

    if (
      debtStrategy === 'hybrid'
    ) {
      return sorted.sort(
        (a, b) => {
          const aScore =
            a.interestRate * 0.7 -
            a.remainingBalance * 0.3;

          const bScore =
            b.interestRate * 0.7 -
            b.remainingBalance * 0.3;

          return bScore - aScore;
        }
      );
    }

    return sorted.sort(
      (a, b) =>
        b.interestRate -
        a.interestRate
    );
  };

  /* =========================
     SIMULATION ENGINE
  ========================= */

  const generateFinancialRoadmap =
    () => {
      const monthlyIncome =
        Number(income);

      const cleanExpenses =
        expenses.map((e) => ({
          ...e,
          amount: Number(
            e.amount || 0
          ),
        }));

      const cleanGoals =
        goals.map((g) => ({
          ...g,
          amount: Number(
            g.amount || 0
          ),
        }));

      const cleanDebts =
        debts.map((d) => ({
          ...d,
          balance: Number(
            d.balance || 0
          ),
          remainingBalance:
            Number(
              d.balance || 0
            ),
          interestRate:
            Number(
              d.interestRate || 0
            ),
          minimumPayment:
            Number(
              d.minimumPayment ||
                0
            ),
          targetMonths:
            Number(
              d.targetMonths ||
                1
            ),
          status: 'active',
        }));

      const totalExpenses =
        cleanExpenses.reduce(
          (sum, e) =>
            sum + e.amount,
          0
        );

      const totalGoals =
        cleanGoals.reduce(
          (sum, g) =>
            sum + g.amount,
          0
        );

      const freeCash =
        monthlyIncome -
        totalExpenses -
        totalGoals;

      const totalDebt =
        cleanDebts.reduce(
          (sum, d) =>
            sum + d.balance,
          0
        );

      const minimumDebtPayments =
        cleanDebts.reduce(
          (sum, d) =>
            sum +
            d.minimumPayment,
          0
        );

      /* =========================
         INSOLVENCY DETECTION
      ========================= */

      if (freeCash <= 0) {
        alert(
          'Expenses exceed income. Plan is not sustainable.'
        );

        return;
      }

      if (
        minimumDebtPayments >
        freeCash
      ) {
        alert(
          'Minimum debt payments exceed available free cash.'
        );

        return;
      }

      /* =========================
         STRATEGY ALLOCATION
      ========================= */

      let debtAllocation = 0.8;
      let savingsAllocation =
        0.2;

      if (
        strategy === 'balanced'
      ) {
        debtAllocation = 0.65;
        savingsAllocation =
          0.35;
      }

      if (
        strategy ===
        'savings-first'
      ) {
        debtAllocation = 0.5;
        savingsAllocation =
          0.5;
      }

      let emergencyFund = 0;

      let investments = 0;

      let houseFund = 0;

      let months = [];

      let currentMonth = 1;

      let activeDebts = [
        ...cleanDebts,
      ];

      let rolloverMoney = 0;

      /* =========================
         DEBT PHASE
      ========================= */

      while (
        activeDebts.some(
          (d) =>
            d.remainingBalance >
            0
        ) &&
        currentMonth <= 60
      ) {
        let tasks = [];

        cleanExpenses.forEach(
          (expense) => {
            tasks.push({
              title: `Pay ${expense.name}`,
              amount:
                expense.amount,
              type: 'expense',
            });
          }
        );

        cleanGoals.forEach(
          (goal) => {
            tasks.push({
              title: `Transfer to ${goal.name}`,
              amount:
                goal.amount,
              type: 'goal',
            });
          }
        );

        activeDebts =
          activeDebts.map(
            (debt) => {
              const monthlyInterest =
                (debt.remainingBalance *
                  (debt.interestRate /
                    100)) /
                12;

              debt.remainingBalance +=
                monthlyInterest;

              return debt;
            }
          );

        activeDebts =
          sortDebts(activeDebts);

        let debtBudget =
          Math.round(
            freeCash *
              debtAllocation
          ) + rolloverMoney;

        let totalPaid =
          0;

        let freedPayments =
          0;

        activeDebts =
          activeDebts
            .map((debt) => {
              if (
                debt.remainingBalance <=
                0
              )
                return debt;

              const remainingMonths =
                Math.max(
                  1,
                  debt.targetMonths -
                    currentMonth +
                    1
                );

              const payoffNeeded =
                debt.remainingBalance /
                remainingMonths;

              const payment =
                Math.min(
                  debt.remainingBalance,
                  Math.max(
                    debt.minimumPayment,
                    payoffNeeded,
                    debtBudget
                  )
                );

              debt.remainingBalance -=
                payment;

              debtBudget -=
                payment;

              totalPaid +=
                payment;

              tasks.push({
                title: `Pay ${debt.name}`,
                amount:
                  Math.round(
                    payment
                  ),
                type: 'debt',
              });

              if (
                debt.remainingBalance <=
                1
              ) {
                debt.remainingBalance = 0;

                debt.status =
                  'paid';

                freedPayments +=
                  debt.minimumPayment;

                tasks.push({
                  title: `${debt.name} cleared 🎉`,
                  amount: 0,
                  type: 'milestone',
                });
              }

              return debt;
            })
            .filter(
              (d) =>
                d.remainingBalance >
                0
            );

        rolloverMoney +=
          freedPayments;

        const savingsContribution =
          Math.round(
            freeCash *
              savingsAllocation
          );

        emergencyFund +=
          savingsContribution;

        tasks.push({
          title:
            'Transfer to Emergency Fund',
          amount:
            savingsContribution,
          type: 'savings',
        });

        tasks.push({
          title:
            'Upload payment screenshots',
          amount: 0,
          type: 'execution',
        });

        tasks.push({
          title:
            'Verify balances',
          amount: 0,
          type: 'execution',
        });

        const remainingDebt =
          activeDebts.reduce(
            (sum, d) =>
              sum +
              d.remainingBalance,
            0
          );

        const netWorth =
          emergencyFund -
          remainingDebt;

        let status =
          'locked';

        if (
          currentMonth === 1
        ) {
          status =
            'active';
        }

        months.push({
          title: `Month ${currentMonth}`,
          monthNumber:
            currentMonth,
          debtPaid:
            totalPaid,
          emergencyFund,
          remainingDebt,
          netWorth,
          rolloverMoney,
          status,
          tasks,
        });

        currentMonth++;
      }

      /* =========================
         WEALTH PHASE
      ========================= */

      let wealthMonths =
        [];

      for (
        let i = 1;
        i <= 24;
        i++
      ) {
        const efContribution =
          Math.round(
            freeCash * 0.3
          );

        const investmentContribution =
          Math.round(
            freeCash * 0.35
          );

        const houseContribution =
          Math.round(
            freeCash * 0.35
          );

        emergencyFund +=
          efContribution;

        investments +=
          investmentContribution;

        houseFund +=
          houseContribution;

        const netWorth =
          emergencyFund +
          investments +
          houseFund;

        wealthMonths.push({
          title: `Wealth Month ${i}`,
          wealthPhase: true,
          netWorth,
          emergencyFund,
          investments,
          houseFund,
          tasks: [
            {
              title:
                'Transfer to Emergency Fund',
              amount:
                efContribution,
            },
            {
              title:
                'Invest Monthly',
              amount:
                investmentContribution,
            },
            {
              title:
                'Transfer to House Fund',
              amount:
                houseContribution,
            },
          ],
        });
      }

      /* =========================
         SMART INSIGHTS
      ========================= */

      let recommendations =
        [];

      const savingsRate =
        Math.round(
          (freeCash /
            monthlyIncome) *
            100
        );

      if (
        savingsRate >= 40
      ) {
        recommendations.push(
          'Excellent savings rate. You are on an accelerated wealth path.'
        );
      }

      if (
        savingsRate < 20
      ) {
        recommendations.push(
          'Savings rate is low. Consider reducing expenses.'
        );
      }

      if (
        totalDebt >
        monthlyIncome * 6
      ) {
        recommendations.push(
          'Debt load is high relative to income.'
        );
      }

      recommendations.push(
        `Debt-free projected in ${months.length} months.`
      );

      /* =========================
         FINAL PLAN
      ========================= */

      const finalPlan = {
        monthlyIncome,
        totalExpenses,
        totalDebt,
        freeCash,
        months,
        wealthMonths,
        projectedNetWorth:
          wealthMonths[
            wealthMonths.length -
              1
          ]?.netWorth || 0,
        savingsRate,
        recommendations,
      };

      setGeneratedPlan(
        finalPlan
      );

      localStorage.setItem(
        `${STORAGE_KEY}-plan`,
        JSON.stringify({
          income,
          expenses,
          debts,
          goals,
          strategy,
          debtStrategy,
          plan: finalPlan,
        })
      );

      setActiveTab(
        'dashboard'
      );
    };

  /* =========================
     PROGRESS
  ========================= */

  const totalItems =
    generatedPlan
      ? generatedPlan.months.flatMap(
          (m) => m.tasks
        ).length
      : 0;

  const completedItems =
    Object.values(checked).filter(
      Boolean
    ).length;

  const progress =
    totalItems > 0
      ? Math.round(
          (completedItems /
            totalItems) *
            100
        )
      : 0;

  /* =========================
     COMPONENTS
  ========================= */

  const Card = ({
    label,
    value,
  }) => (
    <div
      style={{
        background: '#f9fafb',
        padding: '18px',
        borderRadius: '18px',
      }}
    >
      <p>{label}</p>

      <h2>{value}</h2>
    </div>
  );

  /* =========================
     MAIN UI
  ========================= */

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        paddingBottom: '100px',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {/* SETUP */}

        {activeTab ===
          'setup' && (
          <div
            style={{
              background:
                'white',
              borderRadius:
                '28px',
              padding: '28px',
            }}
          >
            <h1>
              Financial Freedom OS
            </h1>

            <input
              type="number"
              placeholder="Monthly Income"
              value={income}
              onChange={(e) =>
                setIncome(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '20px',
              }}
            />

            <button
              onClick={
                generateFinancialRoadmap
              }
              style={{
                width: '100%',
                marginTop:
                  '24px',
                background:
                  'black',
                color: 'white',
                border: 'none',
                padding:
                  '18px',
                borderRadius:
                  '18px',
              }}
            >
              Generate Plan
            </button>
          </div>
        )}

        {/* DASHBOARD */}

        {activeTab ===
          'dashboard' &&
          generatedPlan && (
            <>
              <div
                style={{
                  background:
                    'white',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                }}
              >
                <h1>
                  Master Dashboard
                </h1>

                <p>
                  Progress:{' '}
                  {progress}%
                </p>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '12px',
                    marginTop:
                      '24px',
                  }}
                >
                  <Card
                    label="Income"
                    value={formatCurrency(
                      generatedPlan.monthlyIncome
                    )}
                  />

                  <Card
                    label="Debt"
                    value={formatCurrency(
                      generatedPlan.totalDebt
                    )}
                  />

                  <Card
                    label="Free Cash"
                    value={formatCurrency(
                      generatedPlan.freeCash
                    )}
                  />

                  <Card
                    label="Savings Rate"
                    value={`${generatedPlan.savingsRate}%`}
                  />
                </div>
              </div>

              {/* RECOMMENDATIONS */}

              <div
                style={{
                  background:
                    'white',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                  marginTop:
                    '20px',
                }}
              >
                <h2>
                  Smart Insights
                </h2>

                {generatedPlan.recommendations.map(
                  (
                    rec,
                    idx
                  ) => (
                    <div
                      key={idx}
                      style={{
                        marginTop:
                          '12px',
                        background:
                          '#f9fafb',
                        padding:
                          '14px',
                        borderRadius:
                          '14px',
                      }}
                    >
                      {rec}
                    </div>
                  )
                )}
              </div>
            </>
          )}
      </div>

      {/* BOTTOM TABS */}

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform:
            'translateX(-50%)',
          width: '92%',
          maxWidth: '920px',
          background: 'white',
          borderRadius: '24px',
          padding: '12px',
          display: 'flex',
          gap: '10px',
        }}
      >
        {[
          [
            '⚙️',
            'setup',
          ],
          [
            '🏠',
            'dashboard',
          ],
          [
            '📅',
            'months',
          ],
          [
            '📈',
            'wealth',
          ],
        ].map(
          ([icon, tab]) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab
                )
              }
              style={{
                flex: 1,
                padding:
                  '14px',
                border:
                  'none',
                borderRadius:
                  '14px',
                background:
                  activeTab ===
                  tab
                    ? 'black'
                    : '#f3f4f6',
                color:
                  activeTab ===
                  tab
                    ? 'white'
                    : 'black',
              }}
            >
              {icon}
            </button>
          )
        )}
      </div>
    </div>
  );
}