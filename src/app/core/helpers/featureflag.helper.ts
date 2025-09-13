import { FeatureFlagKey } from "../enums/featureFlag.enum";
import { USER_SINGLE } from "../constants/constants";
import { remoteConfig } from "src/environments/environment.remoteconfig";

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  validateUser: {
    enabled: boolean;
    users: number[];
  };
}

export class FeatureFlagHelper {

  static isFeatureActive( key: FeatureFlagKey): boolean {
    const userId = USER_SINGLE.ID;
    const flags: FeatureFlag[] = remoteConfig.FEATURE_FLAGS || [];
    const flag = flags.find(f => f.key === key);

    if (!flag) return false;

    if (!flag.enabled) return false;

    if (flag.validateUser.enabled) {
      if (userId == null) return false;
      return flag.validateUser.users.includes(userId);
    }

    return true;
  }
}
