import React, { useState } from "react";

import { destroy, patch } from "src/utils/requests";

import { H5, P2, P3 } from "src/components/design_system/typography";
import TextInput from "src/components/design_system/fields/textinput";
import Button from "src/components/design_system/button";
import Checkbox from "src/components/design_system/checkbox";
import Form from "react-bootstrap/Form";
import { ArrowLeft } from "src/components/icons";
import LoadingButton from "src/components/button/LoadingButton";
import Divider from "src/components/design_system/other/Divider";
import Tag from "src/components/design_system/tag";

import { passwordMatchesRequirements } from "src/utils/passwordRequirements";
import { emailRegex, usernameRegex } from "src/utils/regexes";

const NotificationInputs = [
  {
    description: "Someone bought your talent token",
    name: "TokenAcquiredNotification",
  },
  {
    description: "Someone sent you a chat message",
    name: "MessageReceivedNotification",
  },
];

const Settings = (props) => {
  const {
    notificationPreferences,
    user,
    mobile,
    changeTab,
    mode,
    changeSharedState,
    onProfileButtonClick,
    publicButtonType,
    disablePublicButton,
    buttonText,
  } = props;
  const [settings, setSettings] = useState({
    username: user.username || "",
    email: user.email || "",
    messagingDisabled: user.messaging_disabled || false,
    currentPassword: "",
    newPassword: "",
    deletePassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    username: false,
    currentPassword: false,
    newPassword: false,
    deletePassword: false,
  });
  const [saving, setSaving] = useState({
    loading: false,
    profile: false,
    public: false,
  });
  const [emailValidated, setEmailValidated] = useState(false);
  const {
    valid: validPassword,
    errors,
    tags,
  } = passwordMatchesRequirements(settings.newPassword);
  const [notifications, setNotifications] = useState({
    saving: false,
    success: false,
  });

  const changeAttribute = (attribute, value) => {
    if (attribute === "currentPassword" && validationErrors.currentPassword) {
      setValidationErrors((prev) => ({ ...prev, currentPassword: false }));
    } else if (attribute === "email") {
      setValidationErrors((prev) => ({ ...prev, email: false }));
      setEmailValidated(false);
      if (emailRegex.test(value)) validateEmail(value);
    } else if (attribute === "username") {
      if (usernameRegex.test(value)) {
        setValidationErrors((prev) => ({ ...prev, username: false }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          username: "Username only allows lower case letters and numbers",
        }));
      }
    } else if (attribute === "deletePassword") {
      setValidationErrors((prev) => ({ ...prev, deleting: false }));
    }
    setSettings((prevInfo) => ({ ...prevInfo, [attribute]: value }));
  };

  const updateUser = async () => {
    setSaving((prev) => ({ ...prev, loading: true }));

    const response = await patch(`/api/v1/users/${user.id}`, {
      user: {
        ...settings,
        current_password: settings.currentPassword,
        new_password: settings.newPassword,
        messaging_disabled: settings.messagingDisabled,
      },
    }).catch(() => setValidationErrors((prev) => ({ ...prev, saving: true })));

    if (response) {
      if (!response.errors) {
        changeSharedState((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            ...response.user,
          },
        }));
        setSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
        setSaving((prev) => ({ ...prev, loading: false, profile: true }));
      } else {
        setValidationErrors((prev) => ({ ...prev, ...response.errors }));
      }
    }

    setSaving((prev) => ({ ...prev, loading: false }));
  };

  const deleteUser = async () => {
    const response = await destroy(`/api/v1/users/${user.id}`, {
      user: { current_password: settings.deletePassword },
    }).catch(() =>
      setValidationErrors((prev) => ({ ...prev, deleting: true }))
    );

    if (response && response.success) {
      window.location.href = "/";
    } else {
      setValidationErrors((prev) => ({ ...prev, deleting: true }));
    }
  };

  const onTogglePublic = async () => {
    setSaving((prev) => ({ ...prev, loading: true }));
    await onProfileButtonClick();
    setSaving((prev) => ({ ...prev, loading: false, public: true }));
  };

  const setNotificationSettings = (name) => (event) => {
    const value = parseInt(event.currentTarget.value, 10);
    const preferences = { ...notificationPreferences, [name]: value };
    changeSharedState((prev) => ({
      ...prev,
      notificationPreferences: preferences,
    }));
  };

  const updateNotificationSettings = async () => {
    let success = true;
    setNotifications((prev) => ({ ...prev, saving: true, success: false }));

    const response = await patch(`/api/v1/users/${user.id}`, {
      user: {
        notification_preferences: notificationPreferences,
      },
    }).catch(() => (success = false));

    success = success && response && !response.errors;
    setNotifications((prev) => ({ ...prev, saving: false, success }));
  };

  const messagingModeChanged = () =>
    settings.messagingDisabled != user.messaging_disabled;

  const cannotSaveSettings = () =>
    !emailValidated ||
    !!validationErrors.email ||
    settings.username.length == 0 ||
    !!validationErrors.username ||
    !!validationErrors.currentPassword ||
    !!validationErrors.newPassword ||
    (!!settings.newPassword && !validPassword);

  const cannotChangePassword = () =>
    !!validationErrors.currentPassword ||
    !!validationErrors.newPassword ||
    settings.currentPassword.length < 8 ||
    settings.newPassword.length < 8 ||
    (!!settings.newPassword && !validPassword);

  const validateEmail = (value) => {
    if (emailRegex.test(value)) {
      setValidationErrors((prev) => ({ ...prev, email: false }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        email: "Email is not valid",
      }));
    }
    setEmailValidated(true);
  };

  return (
    <>
      <H5
        className="w-100 text-left"
        mode={mode}
        text="Account Settings"
        bold
      />
      <P2
        className="w-100 text-left"
        mode={mode}
        text="Update your username and manage your account"
      />
      <div className="d-flex flex-row w-100 flex-wrap justify-content-between mt-4">
        <TextInput
          title={"Username"}
          mode={mode}
          shortCaption={`Your Talent Protocol URL: /u/${settings.username}`}
          onChange={(e) => changeAttribute("username", e.target.value)}
          value={settings.username}
          className="w-100"
          required
          error={validationErrors.username}
        />
        {validationErrors.username && (
          <P3 className="text-danger" text={validationErrors.username} />
        )}
      </div>
      <div className="d-flex flex-row w-100 flex-wrap mt-4">
        <TextInput
          title="Email"
          type="email"
          mode={mode}
          onChange={(e) => changeAttribute("email", e.target.value)}
          value={settings.email}
          className="w-100"
          required
          error={validationErrors.email}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {validationErrors?.email && (
          <P3 className="text-danger" text={validationErrors.email} />
        )}
      </div>
      <div className="d-flex flex-column w-100 flex-wrap mt-4">
        <P2 bold className="text-black mb-2">
          Disable Messages
        </P2>

        <Checkbox
          className="form-check-input mt-4"
          checked={settings.messagingDisabled}
          onChange={() =>
            changeAttribute("messagingDisabled", !settings.messagingDisabled)
          }
        >
          <div className="d-flex flex-wrap">
            <P2 className="mr-1" text="I don't want to receive messages" />
          </div>
        </Checkbox>
      </div>
      <div className="d-flex flex-row w-100 flex-wrap mt-4">
        <TextInput
          title={"Current Password"}
          type="password"
          placeholder={"*********"}
          mode={mode}
          onChange={(e) => changeAttribute("currentPassword", e.target.value)}
          value={settings.currentPassword}
          className="w-100"
          required
          error={validationErrors.currentPassword}
        />
        {validationErrors?.currentPassword && (
          <P3 className="text-danger" text="Password doesn't match." />
        )}
      </div>
      <div className="d-flex flex-row w-100 justify-content-between mt-4">
        <TextInput
          title={"New Password"}
          type="password"
          placeholder={"*********"}
          mode={mode}
          onChange={(e) => changeAttribute("newPassword", e.target.value)}
          value={settings.newPassword}
          className="w-100"
          error={validationErrors.newPassword}
        />
      </div>
      <div className="d-flex flex-wrap">
        {tags.map((tag) => (
          <Tag
            className={`mr-2 mt-2${errors[tag] ? "" : " bg-success"}`}
            key={tag}
          >
            <P3
              text={tag}
              bold
              className={errors[tag] ? "" : "permanent-text-white"}
            />
          </Tag>
        ))}
      </div>
      <Button
        onClick={() => updateUser()}
        type="primary-default"
        mode={mode}
        disabled={cannotChangePassword()}
        className="mt-4 mb-4 w-100"
      >
        Change password
      </Button>
      {mobile && (
        <div className="d-flex flex-row justify-content-between w-100 mb-3">
          <div className="d-flex flex-column">
            <P3 text="PREVIOUS" />
            <div
              className="text-grey cursor-pointer"
              onClick={() => changeTab("Invites")}
            >
              <ArrowLeft color="currentColor" /> Invites
            </div>
          </div>
        </div>
      )}
      <div
        className={`d-flex flex-row ${
          mobile ? "justify-content-between" : "mt-4"
        } w-100 pb-4`}
      >
        {mobile && buttonText != "N/A" && (
          <LoadingButton
            onClick={() => onTogglePublic()}
            type={publicButtonType}
            disabled={disablePublicButton || saving.loading}
            mode={mode}
            loading={saving.loading}
            success={props.talent.public}
            className="ml-auto mr-3"
            checkClassName="edit-profile-public-check"
          >
            {buttonText}
          </LoadingButton>
        )}
        <LoadingButton
          onClick={() => updateUser()}
          type="primary-default"
          mode={mode}
          disabled={
            (saving.loading || cannotSaveSettings()) && !messagingModeChanged()
          }
          loading={saving.loading}
          success={saving.profile}
        >
          Save Profile
        </LoadingButton>
      </div>

      <Divider className="mb-4" />
      <div className="d-flex flex-column w-100 my-3">
        <H5
          className="w-100 text-left"
          mode={mode}
          text="Email Notification Settings"
          bold
        />
        <P2
          className="w-100 text-left"
          mode={mode}
          text="For each type of notification you can select to receive an immediate email notification, a daily email digest or to not receive any email."
        />

        {NotificationInputs.map((input) => (
          <div
            className="d-flex flex-row w-100 flex-wrap mt-4"
            key={input.name}
          >
            <div className="d-flex flex-column w-100">
              <div className="d-flex flex-row justify-content-between align-items-end">
                <P2 bold className="text-black mb-2">
                  {input.description}
                </P2>
              </div>
              <Form.Control
                as="select"
                onChange={setNotificationSettings(input.name)}
                value={notificationPreferences[input.name]}
                className="height-auto"
              >
                <option value="0">Disabled</option>
                <option value="1">Immediate</option>
                <option value="2">Digest</option>
              </Form.Control>
            </div>
          </div>
        ))}
        <div
          className={`d-flex flex-row ${
            mobile ? "justify-content-between" : "mt-4"
          } w-100 pb-4`}
        >
          <LoadingButton
            onClick={updateNotificationSettings}
            type="primary-default"
            mode={mode}
            loading={notifications.saving}
            disabled={notifications.saving}
            success={notifications.success}
          >
            Save Settings
          </LoadingButton>
        </div>
      </div>

      <Divider className="mb-4" />
      <div className="d-flex flex-column w-100 my-3">
        <H5 className="w-100 text-left" mode={mode} text="Close Account" bold />
        <P2
          className="w-100 text-left"
          mode={mode}
          text="Delete your account and account data"
        />
        <TextInput
          title={"Password"}
          type="password"
          placeholder={"*********"}
          mode={mode}
          onChange={(e) => changeAttribute("deletePassword", e.target.value)}
          value={settings.deletePassword}
          className="w-100 mt-4"
          required
          error={validationErrors.deleting}
        />
        {validationErrors?.deleting && (
          <P3 className="text-danger" text="Wrong password." />
        )}
        <Button
          onClick={() => deleteUser()}
          type="danger-default"
          mode={mode}
          className="w-100 mt-3"
          disabled={settings.deletePassword == ""}
        >
          Delete Account
        </Button>
      </div>
    </>
  );
};

export default Settings;
