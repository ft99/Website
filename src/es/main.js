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
    color: '#2880c3',
    connectParticles: true,
    showCursor: false,
  });

  const options = {
    strings: [
      'Internship Opportunities',
      'Case Competitions',
      'Educational Seminars',
      'Co-op Projects',
      'Private Networking',
      'Job placement',
    ],
    typeSpeed: 40,
    loop: true,
    startDelay: 0,
    backDelay: 2500,
  };

  const typed = new Typed('#typing-network', options);
});
