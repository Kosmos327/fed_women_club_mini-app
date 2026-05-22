import { Button, Div, Group, Spacing, Text } from '@vkontakte/vkui';
import { AppShell } from '../components/AppShell';
import { LoadingState } from '../components/LoadingState';
import type { ApiSavingsResponse } from '../api/client';
import { formatDateTime, formatMoney } from '../utils/format';

type SavingsPageProps = {
  onBack: () => void;
  data: ApiSavingsResponse | null;
  isLoading: boolean;
  error: string;
  filterMode: 'all' | 'period';
  fromDate: string;
  toDate: string;
  onSelectAll: () => void;
  onSelectPeriod: () => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onApplyPeriod: () => void;
  onResetPeriod: () => void;
};

export function SavingsPage(props: SavingsPageProps) {
  const { onBack, data, isLoading, error, filterMode, fromDate, toDate } = props;

  return (
    <AppShell title="Моя экономия" titleClassName="bloom-panel-header-title-glass">
      <Group>
        <Div className="savings-summary-card glass-panel fade-up">
          <Text weight="2">Вы сэкономили</Text>
          <Spacing size={8} />
          <Text className="savings-total" weight="1">{formatMoney(data?.total_saving_amount ?? null)}</Text>
          <Spacing size={8} />
          <Text className="state-note">{filterMode === 'period' ? 'За выбранный период' : 'По использованным привилегиям'}</Text>
        </Div>

        <Div className="savings-filters glass-panel fade-up">
          <div className="savings-filter-tabs">
            <Button className="bloom-button-secondary" mode={filterMode === 'all' ? 'primary' : 'secondary'} onClick={props.onSelectAll}>За всё время</Button>
            <Button className="bloom-button-secondary" mode={filterMode === 'period' ? 'primary' : 'secondary'} onClick={props.onSelectPeriod}>Период</Button>
          </div>
          {filterMode === 'period' ? (
            <>
              <Spacing size={12} />
              <Text>От</Text>
              <input className="catalog-filter-chip" type="date" value={fromDate} onChange={(e) => props.onFromDateChange(e.target.value)} />
              <Spacing size={8} />
              <Text>До</Text>
              <input className="catalog-filter-chip" type="date" value={toDate} onChange={(e) => props.onToDateChange(e.target.value)} />
              <Spacing size={12} />
              <Button className="bloom-button-primary" stretched onClick={props.onApplyPeriod}>Применить</Button>
              <Spacing size={8} />
              <Button className="bloom-button-muted" mode="tertiary" stretched onClick={props.onResetPeriod}>Сбросить</Button>
            </>
          ) : null}
        </Div>

        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <Div className="glass-panel"><Text>Не удалось загрузить экономию. Попробуйте позже.</Text></Div> : null}

        {!isLoading && !error ? (
          <Div className="savings-history fade-up">
            {(data?.items ?? []).length === 0 ? (
              <Div className="glass-panel">
                <Text weight="2">Пока нет использованных привилегий.</Text>
                <Spacing size={8} />
                <Text className="state-note">Получайте коды у партнёров — экономия появится здесь после использования.</Text>
              </Div>
            ) : (
              (data?.items ?? []).map((item, index) => (
                <Div key={String(item.id ?? index)} className="savings-history-card glass-panel">
                  <Text weight="2">Партнёр: {item.partner_name ?? '—'}</Text>
                  <Text className="savings-history-card__meta">Услуга: {item.offer_title ?? '—'}</Text>
                  <Text className="savings-history-card__meta">Использовано: {formatDateTime(item.used_at ?? null)}</Text>
                  <Spacing size={8} />
                  <div className="savings-history-card__money">
                    <Text>Цена без скидки: {formatMoney(item.base_price ?? null)}</Text>
                    <Text>Цена для участницы: {formatMoney(item.final_price ?? null)}</Text>
                    <Text className="savings-saving-amount">Экономия: {formatMoney(item.saving_amount ?? null)}</Text>
                    {item.discount_percent != null ? <Text>Скидка: {String(item.discount_percent)}%</Text> : null}
                  </div>
                </Div>
              ))
            )}
          </Div>
        ) : null}

        <Div>
          <Button className="bloom-button-secondary" mode="secondary" stretched onClick={onBack}>На главную</Button>
        </Div>
      </Group>
    </AppShell>
  );
}
