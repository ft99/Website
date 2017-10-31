$('document').ready(() => {
  $('#perks-nav>li').each((i) => {
    $(`#perks-nav>li:eq(${i})>a`).click((e) => {
      $('#perks-nav>li').removeClass('uk-active');
      $(e.currentTarget)
        .parent()
        .addClass('uk-active');

      while (parseInt($('#perks-card-wrapper>div:first-child>div').attr('data-index'), 10) !== i) {
        $('#perks-card-wrapper>div:last-child')
          .detach()
          .prependTo('#perks-card-wrapper');
      }
    });
  });

  Particles.init({
    selector: '#network-bg',
    color: '#ffffff',
    connectParticles: true,
  });
});
