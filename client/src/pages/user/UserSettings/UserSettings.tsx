import SettingsFormSection from './SettingsFormSection';

const UserSettings = () => {
  return (
    <div className="w-full space-y-6">
      <section className="w-full">
        <h1 className="text-2xl font-bold text-foreground">个人设置</h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理个人信息和通知偏好
        </p>
      </section>

      <SettingsFormSection />
    </div>
  );
};

export default UserSettings;
