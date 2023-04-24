import { CitizenFXCore } from '@citizenfx/client';

const weaponsWithBurstFire = [
    'weapon_pistol', 'weapon_combatpistol', 'weapon_appistol', 'weapon_microsmg', 'weapon_smg', 'weapon_assaultsmg',
    'weapon_combatmg', 'weapon_combatmg_mk2', 'weapon_gusenberg', 'weapon_assaultrifle', 'weapon_carbinerifle',
    'weapon_carbinerifle_mk2', 'weapon_advancedrifle'
];

const safetyToggleKey = 311;
let weaponSafety = true;
let firemode = 0; // 0 = full-auto, 1 = burst, 2 = single

async function weaponFiringModeHandler() {
  const playerPed = PlayerPedId();
  const selectedWeapon = GetSelectedPedWeapon(playerPed);

  // Only run the rest of the code when the player is holding an automatic weapon.
  if (IsAutomaticWeapon(selectedWeapon)) {
    // If the weapon safety feature is turned on, disable the weapon from firing.
    if (weaponSafety) {
      // Disable shooting.
      DisablePlayerFiring(PlayerId(), true);

      // If the user tries to shoot while the safety is enabled, notify them.
      if (IsDisabledControlJustPressed(0, 24)) {
        Screen.ShowNotification("~r~Weapon safety mode is enabled!~n~~w~Press ~y~K ~w~to switch it off.", true);
        PlaySoundFrontend(-1, "Place_Prop_Fail", "DLC_Dmod_Prop_Editor_Sounds", false);
      }
    }
  }
}

    CitizenFXCore.setTick(async () => {
    const playerPed = PlayerPedId();

    if (IsPedArmed(playerPed, 4) && !IsPedInAnyVehicle(playerPed, false)) {
        const weaponHash = GetSelectedPedWeapon(playerPed);
        const weaponName = GetWeapontypeGroup(weaponHash);
        const isAutomaticWeapon = weaponsWithBurstFire.includes(weaponName);


    // If the player pressed L (7/Slowmotion Cinematic Camera Button) ON KEYBOARD ONLY(!) then switch to the next firing mode.
    if (IsInputDisabled(2) && IsControlJustPressed(0, switchFiringModeKey)) {
      // Switch case for the firemode, setting it to the different options and notifying the user via a subtitle.
      switch (firemode) {
        // If it's currently 0, make it 1 and notify the user.
        case 0:
          firemode = 1;
          Screen.ShowSubtitle("Weapon firing mode switched to ~b~burst fire~w~.", 3000);
          PlaySoundFrontend(-1, "Place_Prop_Success", "DLC_Dmod_Prop_Editor_Sounds", false);
          break;
        // If it's currently 1, make it 2 and notify the user.
        case 1:
          firemode = 2;
          Screen.ShowSubtitle("Weapon firing mode switched to ~b~single shot~w~.", 3000);
          PlaySoundFrontend(-1, "Place_Prop_Success", "DLC_Dmod_Prop_Editor_Sounds", false);
          break;
        // If it's currently 2 or somehow anything else, make it 0 and notify the user.
        case 2:
        default:
          firemode = 0;
          Screen.ShowSubtitle("Weapon firing mode switched to ~b~full auto~w~.", 3000);
          PlaySoundFrontend(-1, "Place_Prop_Success", "DLC_Dmod_Prop_Editor_Sounds", false);
          break;
      }
    }

        // Handle fire mode toggle
        if (IsInputDisabled(2) && IsControlJustPressed(0, safetyToggleKey)) {
            weaponSafety = !weaponSafety;
            CitizenFXCore.UI.Screen.ShowSubtitle(`~y~Weapon safety mode ~g~${weaponSafety ? 'enabled' : 'disabled'}~y~.`, 3000);
            PlaySoundFrontend(-1, 'Place_Prop_Success', 'DLC_Dmod_Prop_Editor_Sounds', false);
        }

        // Handle different firing modes
        if (isAutomaticWeapon) {
            switch (firemode) {
                case 1: // Burst firing mode
                    if (IsControlJustPressed(0, 24)) {
                        await Delay(300);
                        while (IsControlPressed(0, 24) || IsDisabledControlPressed(0, 24)) {
                            DisablePlayerFiring(playerPed, true);
                            await Delay(0);
                        }
                    }
                    break;
                case 2: // Single firing mode
                    if (IsControlJustPressed(0, 24)) {
                        while (IsControlPressed(0, 24) || IsDisabledControlPressed(0, 24)) {
                            DisablePlayerFiring(playerPed, true);
                            await Delay(0);
                        }
                    }
                    break;
                default: // Full-auto firing mode
                    break;
            }
        }

        // Show current firing mode visually below ammo count
        if (isAutomaticWeapon) {
            if (weaponSafety) {
                ShowText('~r~X', 0.975, 0.065);
            } else {
                switch (firemode) {
                    case 1:
                        ShowText('||', 0.975, 0.065);
                        break;
                    case 2:
                        ShowText('|', 0.975, 0.065);
                        break;
                    default:
                        ShowText('|||', 0.975, 0.065);
                        break;
                }
            }
        }
    }
});

function ShowText(text: string, posx: number, posy: number) {
    SetTextFont(4);
    SetTextScale(0, 0.31);
    SetTextJustification(1);
    SetTextColour(250, 250, 120, 255);
    SetTextDropshadow(1, 255, 255, 255, 255);
    SetTextEdge(1,255,255,255,255,255);
}
