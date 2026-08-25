using UnityEngine;

public class AudioManager : MonoBehaviour
{
    [Header("Audio Sources")]
    [SerializeField] private AudioSource ambienceSource;
    [SerializeField] private AudioSource sfxSource;

    [Header("Ambiente")]
    [SerializeField] private AudioClip ambienceClip;
    [Range(0f, 1f)][SerializeField] private float ambienceVolume = 0.2f;

    [Header("Efectos")]
    [SerializeField] private AudioClip blockExtractClip;
    [SerializeField] private AudioClip blockPlaceClip;
    [SerializeField] private AudioClip towerCollapseClip;
    [SerializeField] private AudioClip turnChangeClip;
    [Range(0f, 1f)][SerializeField] private float sfxVolume = 0.8f;

    private void Start() => StartAmbience();

    private void StartAmbience()
    {
        if (ambienceSource == null || ambienceClip == null) return;

        ambienceSource.clip = ambienceClip;

        ambienceSource.loop = true;

        ambienceSource.volume = ambienceVolume;

        ambienceSource.Play();
    }

    private void PlaySFX(AudioClip clip)
    {
        if (sfxSource == null || clip == null) return;

        sfxSource.PlayOneShot(clip, sfxVolume);
    }

    public void PlayBlockExtracted() => PlaySFX(blockExtractClip);

    public void PlayBlockPlaced() => PlaySFX(blockPlaceClip);

    public void PlayTowerCollapse() => PlaySFX(towerCollapseClip);

    public void PlayTurnChange() => PlaySFX(turnChangeClip);
}