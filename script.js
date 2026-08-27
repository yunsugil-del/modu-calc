/**
 * 2026 모두의카드 국토교통부 대도시권광역교통위원회 공식 확정 데이터
 */
const MODU_CRITERIA = {
  // 최소 이용 횟수
  minMonthlyCount: 15,

  // 1. 기본 정률 환급률 (공식 확정값)
  rateRatios: {
    general: 0.20,     // 일반: 20%
    youth: 0.30,       // 청년: 30%
    child2: 0.30,      // 2자녀: 30%
    senior: 0.30,      // 어르신: 30%
    child3: 0.50,      // 3자녀 이상: 50%
    lowIncome: 0.533   // 저소득층: 53.3%
  },

  // 2. 2026년 4~9월 반값 기간 시차시간 인센티브 가산율 (+30%p 가산)
  timeShiftBonusRate: 0.30,

  // 3. 일반 기간 정액 기준금액 (일반형 / 플러스형 공식 확정값)
  fixedCaps: {
    capital: { // 수도권
      general:   { basic: 62000, plus: 100000 },
      youth:     { basic: 55000, plus: 90000 },
      child2:    { basic: 55000, plus: 90000 },
      senior:    { basic: 55000, plus: 90000 },
      child3:    { basic: 45000, plus: 80000 },
      lowIncome: { basic: 45000, plus: 80000 }
    },
    local: { // 일반 지방권
      general:   { basic: 55000, plus: 95000 },
      youth:     { basic: 50000, plus: 85000 },
      child2:    { basic: 50000, plus: 85000 },
      senior:    { basic: 50000, plus: 85000 },
      child3:    { basic: 40000, plus: 75000 },
      lowIncome: { basic: 40000, plus: 75000 }
    },
    preferential: { // 우대지원지역
      general:   { basic: 50000, plus: 90000 },
      youth:     { basic: 45000, plus: 80000 },
      child2:    { basic: 45000, plus: 80000 },
      senior:    { basic: 45000, plus: 80000 },
      child3:    { basic: 35000, plus: 70000 },
      lowIncome: { basic: 35000, plus: 70000 }
    },
    special: { // 특별지원지역
      general:   { basic: 45000, plus: 85000 },
      youth:     { basic: 40000, plus: 75000 },
      child2:    { basic: 40000, plus: 75000 },
      senior:    { basic: 40000, plus: 75000 },
      child3:    { basic: 30000, plus: 65000 },
      lowIncome: { basic: 30000, plus: 65000 }
    }
  },

  // 4. 2026년 4~9월 반값 지원 정액 기준금액 (일반형 / 플러스형 공식 확정값)
  fixedCapsHalfPrice: {
    capital: { // 수도권
      general:   { basic: 30000, plus: 50000 },
      youth:     { basic: 25000, plus: 45000 },
      child2:    { basic: 25000, plus: 45000 },
      senior:    { basic: 25000, plus: 45000 },
      child3:    { basic: 22000, plus: 40000 },
      lowIncome: { basic: 22000, plus: 40000 }
    },
    local: { // 일반 지방권
      general:   { basic: 27000, plus: 47000 },
      youth:     { basic: 23000, plus: 42000 },
      child2:    { basic: 23000, plus: 42000 },
      senior:    { basic: 23000, plus: 42000 },
      child3:    { basic: 20000, plus: 37000 },
      lowIncome: { basic: 20000, plus: 37000 }
    },
    preferential: { // 우대지원지역
      general:   { basic: 25000, plus: 45000 },
      youth:     { basic: 21000, plus: 40000 },
      child2:    { basic: 21000, plus: 40000 },
      senior:    { basic: 21000, plus: 40000 },
      child3:    { basic: 17000, plus: 35000 },
      lowIncome: { basic: 17000, plus: 35000 }
    },
    special: { // 특별지원지역
      general:   { basic: 22000, plus: 42000 },
      youth:     { basic: 20000, plus: 37000 },
      child2:    { basic: 20000, plus: 37000 },
      senior:    { basic: 20000, plus: 37000 },
      child3:    { basic: 15000, plus: 32000 },
      lowIncome: { basic: 15000, plus: 32000 }
    }
  }
};

// 라벨 매핑
const LABELS = {
  userType: { general: '일반', youth: '청년', child2: '2자녀', senior: '어르신', child3: '3자녀 이상', lowIncome: '저소득' },
  region: { capital: '수도권', local: '일반 지방권', preferential: '우대지원지역', special: '특별지원지역' },
  period: { halfPrice: '2026년 4~9월 반값', regular: '일반 기간' },
  hasExpress: { yes: '광역·GTX 포함', no: '일반 시내·지하철 위주' }
};

// DOM 요소 캐싱
const monthlyCostInput = document.getElementById('monthlyCost');
const monthlyCountInput = document.getElementById('monthlyCount');
const timeShiftCostInput = document.getElementById('timeShiftCost');
const btnCalculate = document.getElementById('btnCalculate');
const btnReset = document.getElementById('btnReset');
const btnRecalculate = document.getElementById('btnRecalculate');
const resultSection = document.getElementById('resultSection');
const underCountBlock = document.getElementById('underCountBlock');
const validResultBlock = document.getElementById('validResultBlock');
const bestMethodBadge = document.getElementById('bestMethodBadge');

// 숫자 포맷 함수
function formatNumber(num) {
  return Number(num).toLocaleString('ko-KR');
}

// 숫자 파싱 함수
function parseNumber(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
}

// 실시간 자동 콤마 바인딩
[monthlyCostInput, monthlyCountInput, timeShiftCostInput].forEach(input => {
  if (!input) return;
  input.addEventListener('input', function(e) {
    const val = parseNumber(e.target.value);
    e.target.value = val > 0 ? formatNumber(val) : '';
  });
});

// 초기 날짜 기반 자동 기본값 세팅
function initDefaultPeriod() {
  const now = new Date();
  const is2026HalfPrice = (now >= new Date('2026-04-01') && now <= new Date('2026-09-30'));
  if (is2026HalfPrice) {
    document.getElementById('periodHalfPrice').checked = true;
  } else {
    document.getElementById('periodRegular').checked = true;
  }
}
initDefaultPeriod();

// 메인 계산 함수
function calculate() {
  const totalCost = parseNumber(monthlyCostInput.value);
  const count = parseNumber(monthlyCountInput.value);
  const timeShiftCost = parseNumber(timeShiftCostInput.value);
  const isFirstMonth = document.querySelector('input[name="isFirstMonth"]:checked').value === 'yes';
  const hasExpress = document.querySelector('input[name="hasExpress"]:checked').value === 'yes';

  // 1. 유효성 검사
  if (totalCost <= 0) {
    alert('월 대중교통비를 올바르게 입력해 주세요 (0원 초과).');
    monthlyCostInput.focus();
    return;
  }
  if (count <= 0) {
    alert('월 이용 횟수를 올바르게 입력해 주세요 (1회 이상).');
    monthlyCountInput.focus();
    return;
  }
  if (timeShiftCost > totalCost) {
    alert('출퇴근 시차시간 이용금액은 월 전체 교통비보다 클 수 없습니다.');
    timeShiftCostInput.focus();
    return;
  }

  // 2. 파라미터 수집
  const userType = document.querySelector('input[name="userType"]:checked').value;
  const region = document.querySelector('input[name="region"]:checked').value;
  const period = document.querySelector('input[name="period"]:checked').value;

  resultSection.style.display = 'block';

  // 3. 월 15회 검증 (가입 첫 달 예외)
  if (count < MODU_CRITERIA.minMonthlyCount && !isFirstMonth) {
    underCountBlock.style.display = 'block';
    validResultBlock.style.display = 'none';
    scrollToResult();
    return;
  }

  underCountBlock.style.display = 'none';
  validResultBlock.style.display = 'block';

  // 4. [방식 1] 정률제 계산
  const baseRate = MODU_CRITERIA.rateRatios[userType] || 0.20;
  let rateRefund = 0;
  const regularCost = totalCost - timeShiftCost;

  if (period === 'halfPrice' && timeShiftCost > 0) {
    const shiftRate = baseRate + MODU_CRITERIA.timeShiftBonusRate;
    rateRefund = Math.round((regularCost * baseRate) + (timeShiftCost * shiftRate));
  } else {
    rateRefund = Math.round(totalCost * baseRate);
  }
  rateRefund = Math.min(rateRefund, totalCost);

  // 5. [방식 2 & 3] 일반형 / 플러스형 정액제 계산 및 수단 조건 분기
  const capMatrix = (period === 'halfPrice') ? MODU_CRITERIA.fixedCapsHalfPrice : MODU_CRITERIA.fixedCaps;
  const targetCaps = capMatrix[region][userType];

  const basicCap = targetCaps.basic;
  const plusCap = targetCaps.plus;

  let fixedBasicRefund = 0;
  let fixedPlusRefund = 0;
  let basicDisplayTxt = '';
  let plusDisplayTxt = '';

  if (hasExpress) {
    fixedBasicRefund = 0;
    basicDisplayTxt = '미적용 (광역·GTX 이용)';
    fixedPlusRefund = Math.min(Math.max(0, totalCost - plusCap), totalCost);
    plusDisplayTxt = `${formatNumber(fixedPlusRefund)}원`;
  } else {
    fixedBasicRefund = Math.min(Math.max(0, totalCost - basicCap), totalCost);
    basicDisplayTxt = `${formatNumber(fixedBasicRefund)}원`;
    fixedPlusRefund = Math.min(Math.max(0, totalCost - plusCap), totalCost);
    plusDisplayTxt = `${formatNumber(fixedPlusRefund)}원 (일반수단 기준)`;
  }

  // 6. 유리한 방식 판정 (수단 조건 반영)
  let finalRefund = rateRefund;
  let appliedMethod = '정률제';

  if (hasExpress) {
    if (fixedPlusRefund > finalRefund) {
      finalRefund = fixedPlusRefund;
      appliedMethod = `플러스형 정액제 (기준금액 ${formatNumber(plusCap)}원 초과분)`;
    }
  } else {
    if (fixedBasicRefund > finalRefund) {
      finalRefund = fixedBasicRefund;
      appliedMethod = `일반형 정액제 (기준금액 ${formatNumber(basicCap)}원 초과분)`;
    }
  }

  // 실부담금 및 연간 추정치
  const actualCost = Math.max(0, totalCost - finalRefund);
  const yearlyRefund = finalRefund * 12;

  // 7. 결과 화면 바인딩
  bestMethodBadge.textContent = `${appliedMethod.split(' (')[0]} 적용`;
  document.getElementById('finalRefundText').textContent = `${formatNumber(finalRefund)}원`;
  document.getElementById('yearlyRefundText').textContent = `약 ${formatNumber(yearlyRefund)}원`;
  document.getElementById('rateRefundText').textContent = `${formatNumber(rateRefund)}원`;
  document.getElementById('fixedBasicRefundText').textContent = basicDisplayTxt;
  document.getElementById('fixedPlusRefundText').textContent = plusDisplayTxt;
  document.getElementById('appliedMethodText').textContent = appliedMethod;
  document.getElementById('summaryCostText').textContent = `${formatNumber(totalCost)}원`;
  document.getElementById('actualCostText').textContent = `${formatNumber(actualCost)}원`;

  // 시차시간 상세 행 노출 제어
  const regularCostRow = document.getElementById('regularCostRow');
  const timeShiftCostRow = document.getElementById('timeShiftCostRow');
  if (timeShiftCost > 0) {
    regularCostRow.style.display = 'flex';
    timeShiftCostRow.style.display = 'flex';
    document.getElementById('regularCostText').textContent = `${formatNumber(regularCost)}원 (기본 ${(baseRate * 100).toFixed(1).replace('.0', '')}%)`;
    const appliedShiftRate = (period === 'halfPrice') ? (baseRate + MODU_CRITERIA.timeShiftBonusRate) : baseRate;
    document.getElementById('timeShiftCostSummaryText').textContent = `${formatNumber(timeShiftCost)}원 (시차 ${(appliedShiftRate * 100).toFixed(1).replace('.0', '')}%)`;
  } else {
    regularCostRow.style.display = 'none';
    timeShiftCostRow.style.display = 'none';
  }

  // 조건 요약 텍스트
  const summaryEl = document.getElementById('appliedConditionSummary');
  const firstMonthText = isFirstMonth ? ' · 가입 첫 달' : '';
  summaryEl.innerHTML = `
    <strong>선택 조건:</strong> ${LABELS.userType[userType]} · ${LABELS.region[region]} · ${LABELS.hasExpress[hasExpress ? 'yes' : 'no']} · ${LABELS.period[period]}${firstMonthText} (월 ${count}회 이용)
  `;

  scrollToResult();
}

function scrollToResult() {
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  monthlyCostInput.value = '';
  monthlyCountInput.value = '';
  timeShiftCostInput.value = '';
  document.querySelector('input[name="hasExpress"][value="no"]').checked = true;
  document.querySelector('input[name="isFirstMonth"][value="no"]').checked = true;
  document.querySelector('input[name="userType"][value="general"]').checked = true;
  document.querySelector('input[name="region"][value="capital"]').checked = true;
  initDefaultPeriod();
  resultSection.style.display = 'none';
  bestMethodBadge.textContent = "계산 완료";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

btnCalculate.addEventListener('click', calculate);
btnReset.addEventListener('click', resetForm);
btnRecalculate.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
