import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { useDebts } from '../state/DebtContext';
import { colors, font, radius, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditDebt'>;

interface FormState {
  name: string;
  balance: string;
  apr: string;
  minimumPayment: string;
}

interface FieldErrors {
  name?: string;
  balance?: string;
  apr?: string;
  minimumPayment?: string;
}

export function AddEditDebtScreen({ navigation, route }: Props) {
  const { debts, addDebt, updateDebt } = useDebts();
  const insets = useSafeAreaInsets();
  const editingId = route.params?.debtId;
  const existing = debts.find((d) => d.id === editingId);

  const [form, setForm] = useState<FormState>({
    name: existing?.name ?? '',
    balance: existing ? String(existing.balance) : '',
    apr: existing ? String(existing.apr) : '',
    minimumPayment: existing ? String(existing.minimumPayment) : '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = 'Give this debt a name.';

    const balance = parseFloat(form.balance);
    if (isNaN(balance) || balance <= 0) next.balance = 'Enter a balance greater than 0.';

    const apr = parseFloat(form.apr);
    if (isNaN(apr) || apr < 0 || apr > 100) next.apr = 'Enter an APR between 0 and 100.';

    const min = parseFloat(form.minimumPayment);
    if (isNaN(min) || min < 0) next.minimumPayment = 'Enter a valid minimum payment.';

    return next;
  };

  const handleSave = () => {
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const payload = {
      name: form.name.trim(),
      balance: parseFloat(form.balance),
      apr: parseFloat(form.apr),
      minimumPayment: parseFloat(form.minimumPayment),
    };

    if (existing) {
      updateDebt({ ...existing, ...payload });
    } else {
      addDebt(payload);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: spacing.md }}>
          <Field
            label="Debt name"
            placeholder="e.g. Chase Sapphire"
            value={form.name}
            onChangeText={(t) => setField('name', t)}
            error={errors.name}
            autoFocus={!existing}
          />
          <Field
            label="Current balance"
            placeholder="0"
            prefix="$"
            keyboardType="decimal-pad"
            value={form.balance}
            onChangeText={(t) => setField('balance', t)}
            error={errors.balance}
          />
          <Field
            label="Interest rate (APR)"
            placeholder="0.00"
            suffix="%"
            keyboardType="decimal-pad"
            value={form.apr}
            onChangeText={(t) => setField('apr', t)}
            error={errors.apr}
          />
          <Field
            label="Minimum monthly payment"
            placeholder="0"
            prefix="$"
            keyboardType="decimal-pad"
            value={form.minimumPayment}
            onChangeText={(t) => setField('minimumPayment', t)}
            error={errors.minimumPayment}
          />
        </Card>

        <AppButton label={existing ? 'Save changes' : 'Add debt'} onPress={handleSave} />
        <AppButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  keyboardType?: 'default' | 'decimal-pad';
  error?: string;
  autoFocus?: boolean;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  suffix,
  keyboardType = 'default',
  error,
  autoFocus,
}: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !!error && styles.inputError]}>
        {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
        />
        {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  label: {
    color: colors.textMuted,
    fontSize: font.small,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  affix: {
    color: colors.textMuted,
    fontSize: font.h3,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: font.h3,
    fontWeight: '600',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: font.small,
    marginTop: spacing.xs,
  },
});
